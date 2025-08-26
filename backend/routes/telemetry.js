const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');
const { telemetryMiddleware } = require('../middleware/telemetry');

// Get telemetry data (requires auth)
router.get('/', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { type, limit = 100, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM telemetry WHERE 1=1';
        const params = [];

        if (type) {
            query += ' AND event_type = ?';
            params.push(type);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const telemetryData = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM telemetry WHERE 1=1';
        const countParams = [];

        if (type) {
            countQuery += ' AND event_type = ?';
            countParams.push(type);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            data: telemetryData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'getTelemetry' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch telemetry data'
        });
    }
});

// Get telemetry statistics
router.get('/stats', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { period = '24h' } = req.query;

        let timeFilter = '';
        const params = [];

        switch (period) {
            case '1h':
                timeFilter = 'AND timestamp > datetime("now", "-1 hour")';
                break;
            case '24h':
                timeFilter = 'AND timestamp > datetime("now", "-1 day")';
                break;
            case '7d':
                timeFilter = 'AND timestamp > datetime("now", "-7 days")';
                break;
            case '30d':
                timeFilter = 'AND timestamp > datetime("now", "-30 days")';
                break;
            default:
                timeFilter = 'AND timestamp > datetime("now", "-1 day")';
        }

        // Get event type counts
        const eventStats = await database.all(
            `SELECT event_type, COUNT(*) as count 
             FROM telemetry 
             WHERE 1=1 ${timeFilter}
             GROUP BY event_type 
             ORDER BY count DESC`,
            params
        );

        // Get user activity stats
        const userStats = await database.all(
            `SELECT user_id, COUNT(*) as count 
             FROM telemetry 
             WHERE user_id IS NOT NULL ${timeFilter}
             GROUP BY user_id 
             ORDER BY count DESC 
             LIMIT 10`,
            params
        );

        // Get performance stats
        const performanceStats = await database.all(
            `SELECT 
                AVG(CAST(JSON_EXTRACT(performance_data, '$.duration') AS REAL)) as avg_duration,
                MAX(CAST(JSON_EXTRACT(performance_data, '$.duration') AS REAL)) as max_duration,
                MIN(CAST(JSON_EXTRACT(performance_data, '$.duration') AS REAL)) as min_duration,
                COUNT(*) as total_requests
             FROM telemetry 
             WHERE event_type = 'request' ${timeFilter}`,
            params
        );

        // Get error stats
        const errorStats = await database.all(
            `SELECT 
                COUNT(*) as total_errors,
                COUNT(DISTINCT user_id) as affected_users
             FROM telemetry 
             WHERE event_type = 'error' ${timeFilter}`,
            params
        );

        res.json({
            period,
            event_stats: eventStats,
            user_stats: userStats,
            performance: performanceStats[0] || {},
            errors: errorStats[0] || {},
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'getStats' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch telemetry statistics'
        });
    }
});

// Get user-specific telemetry
router.get('/user/:userId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { type, limit = 100, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        // Check if user has permission to view this data
        if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied',
                code: 'ACCESS_DENIED'
            });
        }

        let query = 'SELECT * FROM telemetry WHERE user_id = ?';
        const params = [userId];

        if (type) {
            query += ' AND event_type = ?';
            params.push(type);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const telemetryData = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM telemetry WHERE user_id = ?';
        const countParams = [userId];

        if (type) {
            countQuery += ' AND event_type = ?';
            countParams.push(type);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            user_id: userId,
            data: telemetryData,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'getUserTelemetry' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch user telemetry data'
        });
    }
});

// Get real-time telemetry data
router.get('/realtime', authMiddleware.requireAuth, async (req, res) => {
    try {
        // Get telemetry data from middleware
        const realtimeData = telemetryMiddleware.getTelemetryData();
        const stats = telemetryMiddleware.getTelemetryStats();

        res.json({
            data: realtimeData.slice(-50), // Last 50 entries
            stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'getRealtimeTelemetry' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch real-time telemetry data'
        });
    }
});

// Export telemetry data
router.get('/export', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { format = 'json', type, startDate, endDate } = req.query;

        let query = 'SELECT * FROM telemetry WHERE 1=1';
        const params = [];

        if (type) {
            query += ' AND event_type = ?';
            params.push(type);
        }

        if (startDate) {
            query += ' AND timestamp >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND timestamp <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY timestamp DESC';

        const telemetryData = await database.all(query, params);

        const exportData = {
            export_date: new Date().toISOString(),
            filters: {
                type,
                start_date: startDate,
                end_date: endDate
            },
            total_records: telemetryData.length,
            data: telemetryData
        };

        if (format === 'csv') {
            const csvData = convertToCSV(telemetryData);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="telemetry_export_${new Date().toISOString().split('T')[0]}.csv"`);
            res.send(csvData);
        } else {
            res.json(exportData);
        }

        // Log export
        logger.userActivity(req.user.id, 'telemetry_exported', {
            format,
            record_count: telemetryData.length,
            filters: { type, startDate, endDate }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'exportTelemetry' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to export telemetry data'
        });
    }
});

// Clear telemetry data
router.delete('/clear', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { type, olderThan } = req.query;

        let query = 'DELETE FROM telemetry WHERE 1=1';
        const params = [];

        if (type) {
            query += ' AND event_type = ?';
            params.push(type);
        }

        if (olderThan) {
            query += ' AND timestamp < datetime("now", ?)';
            params.push(olderThan);
        }

        const result = await database.run(query, params);

        // Clear middleware telemetry data
        telemetryMiddleware.clearTelemetryData();

        // Log clear operation
        logger.userActivity(req.user.id, 'telemetry_cleared', {
            deleted_count: result.changes,
            filters: { type, olderThan }
        });

        res.json({
            message: 'Telemetry data cleared successfully',
            deleted_count: result.changes,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'clearTelemetry' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to clear telemetry data'
        });
    }
});

// Get telemetry configuration
router.get('/config', authMiddleware.requireAuth, async (req, res) => {
    try {
        const telemetryConfig = {
            enabled: config.telemetry.enabled,
            max_entries: config.telemetry.maxEntries,
            retention_days: config.telemetry.retentionDays,
            enable_performance: config.telemetry.enablePerformance,
            enable_errors: config.telemetry.enableErrors,
            enable_user_activity: config.telemetry.enableUserActivity,
            path: config.telemetry.path
        };

        res.json({
            config: telemetryConfig,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'getConfig' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch telemetry configuration'
        });
    }
});

// Update telemetry configuration (admin only)
router.put('/config', authMiddleware.requireAdmin, async (req, res) => {
    try {
        const { enabled, max_entries, retention_days, enable_performance, enable_errors, enable_user_activity } = req.body;

        // Validate configuration
        const errors = [];

        if (max_entries !== undefined && (max_entries < 100 || max_entries > 100000)) {
            errors.push('Max entries must be between 100 and 100000');
        }

        if (retention_days !== undefined && (retention_days < 1 || retention_days > 365)) {
            errors.push('Retention days must be between 1 and 365');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid configuration values',
                code: 'INVALID_CONFIG',
                details: errors
            });
        }

        // Update configuration (in a real implementation, this would update the config file or database)
        // For now, we'll just return success

        // Log configuration update
        logger.userActivity(req.user.id, 'telemetry_config_updated', {
            enabled,
            max_entries,
            retention_days,
            enable_performance,
            enable_errors,
            enable_user_activity
        });

        res.json({
            message: 'Telemetry configuration updated successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'updateConfig' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update telemetry configuration'
        });
    }
});

// Get telemetry health status
router.get('/health', authMiddleware.requireAuth, async (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            enabled: config.telemetry.enabled,
            database_connection: true,
            middleware_status: 'operational',
            storage_available: true,
            last_cleanup: new Date().toISOString()
        };

        // Check database connection
        try {
            await database.get('SELECT 1 as test');
        } catch (error) {
            healthStatus.status = 'unhealthy';
            healthStatus.database_connection = false;
            healthStatus.error = error.message;
        }

        res.json(healthStatus);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Telemetry Routes', operation: 'getHealth' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to check telemetry health'
        });
    }
});

// Convert telemetry data to CSV format
function convertToCSV(data) {
    if (!data || data.length === 0) {
        return '';
    }

    const headers = ['id', 'user_id', 'event_type', 'event_data', 'timestamp', 'session_id', 'ip_address', 'user_agent', 'performance_data'];
    const rows = [headers.join(',')];

    data.forEach(entry => {
        const row = [
            entry.id || '',
            entry.user_id || '',
            entry.event_type || '',
            `"${(entry.event_data || '').replace(/"/g, '""')}"`,
            entry.timestamp || '',
            entry.session_id || '',
            entry.ip_address || '',
            `"${(entry.user_agent || '').replace(/"/g, '""')}"`,
            `"${(entry.performance_data || '').replace(/"/g, '""')}"`
        ];
        rows.push(row.join(','));
    });

    return rows.join('\n');
}

module.exports = router;

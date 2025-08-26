const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');

// Get all connectors for a user
router.get('/', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { type, status, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM connectors WHERE user_id = ?';
        const params = [req.user.id];

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const connectors = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM connectors WHERE user_id = ?';
        const countParams = [req.user.id];

        if (type) {
            countQuery += ' AND type = ?';
            countParams.push(type);
        }

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            connectors,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'getConnectors' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch connectors'
        });
    }
});

// Get a specific connector
router.get('/:connectorId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;

        const connector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!connector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        // Get connector logs
        const logs = await database.all(
            'SELECT * FROM connector_logs WHERE connector_id = ? ORDER BY created_at DESC LIMIT 50',
            [connectorId]
        );

        res.json({
            connector,
            logs,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'getConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch connector'
        });
    }
});

// Create a new connector
router.post('/', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { type, name, description, config, category } = req.body;

        // Validate required fields
        if (!type || !name) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Type and name are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate connector type
        const validTypes = ['health', 'creativity', 'finance', 'community', 'governance', 'custom'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid connector type',
                code: 'INVALID_CONNECTOR_TYPE',
                valid_types: validTypes
            });
        }

        const result = await database.run(
            `INSERT INTO connectors (
                user_id, type, name, description, config, category, 
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                req.user.id, type, name, description || '', 
                config ? JSON.stringify(config) : null,
                category || type, 'inactive'
            ]
        );

        const newConnector = await database.get(
            'SELECT * FROM connectors WHERE id = ?',
            [result.lastID]
        );

        // Log connector creation
        logger.userActivity(req.user.id, 'connector_created', {
            connector_id: result.lastID,
            connector_type: type,
            connector_name: name
        });

        res.status(201).json({
            connector: newConnector,
            message: 'Connector created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'createConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create connector'
        });
    }
});

// Update a connector
router.put('/:connectorId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;
        const { name, description, config, status } = req.body;

        // Check if connector exists and belongs to user
        const existingConnector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!existingConnector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['active', 'inactive', 'error', 'maintenance'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid status',
                    code: 'INVALID_STATUS'
                });
            }
        }

        const updateFields = [];
        const params = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            params.push(name);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }

        if (config !== undefined) {
            updateFields.push('config = ?');
            params.push(JSON.stringify(config));
        }

        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }

        updateFields.push('updated_at = datetime("now")');
        params.push(connectorId, req.user.id);

        const query = `UPDATE connectors SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
        await database.run(query, params);

        const updatedConnector = await database.get(
            'SELECT * FROM connectors WHERE id = ?',
            [connectorId]
        );

        // Log connector update
        logger.userActivity(req.user.id, 'connector_updated', {
            connector_id: connectorId,
            updated_fields: Object.keys(req.body)
        });

        res.json({
            connector: updatedConnector,
            message: 'Connector updated successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'updateConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update connector'
        });
    }
});

// Delete a connector
router.delete('/:connectorId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;

        // Check if connector exists and belongs to user
        const connector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!connector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        // Delete connector logs first
        await database.run(
            'DELETE FROM connector_logs WHERE connector_id = ?',
            [connectorId]
        );

        // Delete the connector
        await database.run(
            'DELETE FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        // Log connector deletion
        logger.userActivity(req.user.id, 'connector_deleted', {
            connector_id: connectorId,
            connector_name: connector.name
        });

        res.json({
            message: 'Connector deleted successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'deleteConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete connector'
        });
    }
});

// Activate a connector
router.post('/:connectorId/activate', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;

        // Check if connector exists and belongs to user
        const connector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!connector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        if (connector.status === 'active') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Connector is already active',
                code: 'ALREADY_ACTIVE'
            });
        }

        // Simulate activation process
        try {
            // In a real implementation, this would test the connector configuration
            // and establish the connection
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update connector status
            await database.run(
                'UPDATE connectors SET status = ?, updated_at = datetime("now") WHERE id = ?',
                ['active', connectorId]
            );

            // Log activation
            await database.run(
                `INSERT INTO connector_logs (
                    connector_id, level, message, details, created_at
                ) VALUES (?, ?, ?, ?, datetime('now'))`,
                [connectorId, 'info', 'Connector activated successfully', JSON.stringify({ action: 'activate' })]
            );

            // Log user activity
            logger.userActivity(req.user.id, 'connector_activated', {
                connector_id: connectorId,
                connector_name: connector.name
            });

            res.json({
                message: 'Connector activated successfully',
                timestamp: new Date().toISOString()
            });

        } catch (activationError) {
            // Update connector status to error
            await database.run(
                'UPDATE connectors SET status = ?, updated_at = datetime("now") WHERE id = ?',
                ['error', connectorId]
            );

            // Log error
            await database.run(
                `INSERT INTO connector_logs (
                    connector_id, level, message, details, created_at
                ) VALUES (?, ?, ?, ?, datetime('now'))`,
                [connectorId, 'error', 'Failed to activate connector', JSON.stringify({ error: activationError.message })]
            );

            throw activationError;
        }

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'activateConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to activate connector'
        });
    }
});

// Deactivate a connector
router.post('/:connectorId/deactivate', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;

        // Check if connector exists and belongs to user
        const connector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!connector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        if (connector.status !== 'active') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Connector is not active',
                code: 'NOT_ACTIVE'
            });
        }

        // Simulate deactivation process
        try {
            // In a real implementation, this would gracefully close the connection
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update connector status
            await database.run(
                'UPDATE connectors SET status = ?, updated_at = datetime("now") WHERE id = ?',
                ['inactive', connectorId]
            );

            // Log deactivation
            await database.run(
                `INSERT INTO connector_logs (
                    connector_id, level, message, details, created_at
                ) VALUES (?, ?, ?, ?, datetime('now'))`,
                [connectorId, 'info', 'Connector deactivated successfully', JSON.stringify({ action: 'deactivate' })]
            );

            // Log user activity
            logger.userActivity(req.user.id, 'connector_deactivated', {
                connector_id: connectorId,
                connector_name: connector.name
            });

            res.json({
                message: 'Connector deactivated successfully',
                timestamp: new Date().toISOString()
            });

        } catch (deactivationError) {
            // Log error
            await database.run(
                `INSERT INTO connector_logs (
                    connector_id, level, message, details, created_at
                ) VALUES (?, ?, ?, ?, datetime('now'))`,
                [connectorId, 'error', 'Failed to deactivate connector', JSON.stringify({ error: deactivationError.message })]
            );

            throw deactivationError;
        }

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'deactivateConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to deactivate connector'
        });
    }
});

// Test a connector
router.post('/:connectorId/test', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;

        // Check if connector exists and belongs to user
        const connector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!connector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        // Simulate connection test
        try {
            const startTime = Date.now();
            
            // In a real implementation, this would test the actual connection
            await new Promise(resolve => setTimeout(resolve, 2000));

            const endTime = Date.now();
            const latency = endTime - startTime;

            // Log test result
            await database.run(
                `INSERT INTO connector_logs (
                    connector_id, level, message, details, created_at
                ) VALUES (?, ?, ?, ?, datetime('now'))`,
                [connectorId, 'info', 'Connector test successful', JSON.stringify({ latency, test_result: 'success' })]
            );

            // Log user activity
            logger.userActivity(req.user.id, 'connector_tested', {
                connector_id: connectorId,
                connector_name: connector.name,
                test_result: 'success',
                latency
            });

            res.json({
                message: 'Connector test successful',
                latency,
                status: 'success',
                timestamp: new Date().toISOString()
            });

        } catch (testError) {
            // Log test failure
            await database.run(
                `INSERT INTO connector_logs (
                    connector_id, level, message, details, created_at
                ) VALUES (?, ?, ?, ?, datetime('now'))`,
                [connectorId, 'error', 'Connector test failed', JSON.stringify({ error: testError.message })]
            );

            throw testError;
        }

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'testConnector' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to test connector'
        });
    }
});

// Get connector logs
router.get('/:connectorId/logs', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectorId } = req.params;
        const { level, limit = 50, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        // Check if connector exists and belongs to user
        const connector = await database.get(
            'SELECT * FROM connectors WHERE id = ? AND user_id = ?',
            [connectorId, req.user.id]
        );

        if (!connector) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connector not found',
                code: 'CONNECTOR_NOT_FOUND'
            });
        }

        let query = 'SELECT * FROM connector_logs WHERE connector_id = ?';
        const params = [connectorId];

        if (level) {
            query += ' AND level = ?';
            params.push(level);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const logs = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM connector_logs WHERE connector_id = ?';
        const countParams = [connectorId];

        if (level) {
            countQuery += ' AND level = ?';
            countParams.push(level);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'getConnectorLogs' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch connector logs'
        });
    }
});

// Get available connector types
router.get('/types/available', authMiddleware.requireAuth, async (req, res) => {
    try {
        const connectorTypes = [
            {
                type: 'health',
                name: 'Health Connector',
                description: 'Connect to health and wellness services',
                category: 'wellness',
                configurable: true,
                config_schema: {
                    api_key: { type: 'string', required: true },
                    endpoint: { type: 'string', required: true },
                    sync_frequency: { type: 'number', default: 3600 }
                }
            },
            {
                type: 'creativity',
                name: 'Creativity Connector',
                description: 'Connect to creative and artistic services',
                category: 'arts',
                configurable: true,
                config_schema: {
                    api_key: { type: 'string', required: true },
                    project_id: { type: 'string', required: false },
                    auto_sync: { type: 'boolean', default: true }
                }
            },
            {
                type: 'finance',
                name: 'Finance Connector',
                description: 'Connect to financial planning services',
                category: 'business',
                configurable: true,
                config_schema: {
                    api_key: { type: 'string', required: true },
                    account_id: { type: 'string', required: true },
                    sync_transactions: { type: 'boolean', default: true }
                }
            },
            {
                type: 'community',
                name: 'Community Connector',
                description: 'Connect to community and social services',
                category: 'social',
                configurable: true,
                config_schema: {
                    api_key: { type: 'string', required: true },
                    group_id: { type: 'string', required: false },
                    notifications: { type: 'boolean', default: true }
                }
            },
            {
                type: 'governance',
                name: 'Governance Connector',
                description: 'Connect to governance and decision-making services',
                category: 'management',
                configurable: true,
                config_schema: {
                    api_key: { type: 'string', required: true },
                    organization_id: { type: 'string', required: true },
                    permissions: { type: 'array', default: ['read'] }
                }
            },
            {
                type: 'custom',
                name: 'Custom Connector',
                description: 'Create a custom connector for specific needs',
                category: 'custom',
                configurable: true,
                config_schema: {
                    endpoint: { type: 'string', required: true },
                    method: { type: 'string', default: 'GET' },
                    headers: { type: 'object', default: {} },
                    authentication: { type: 'object', required: false }
                }
            }
        ];

        res.json({
            connector_types: connectorTypes,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'getAvailableTypes' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch available connector types'
        });
    }
});

// Get connector statistics
router.get('/stats', authMiddleware.requireAuth, async (req, res) => {
    try {
        // Get connector counts by type
        const typeStats = await database.all(
            'SELECT type, COUNT(*) as count FROM connectors WHERE user_id = ? GROUP BY type',
            [req.user.id]
        );

        // Get connector counts by status
        const statusStats = await database.all(
            'SELECT status, COUNT(*) as count FROM connectors WHERE user_id = ? GROUP BY status',
            [req.user.id]
        );

        // Get total connectors
        const totalConnectors = await database.get(
            'SELECT COUNT(*) as count FROM connectors WHERE user_id = ?',
            [req.user.id]
        );

        // Get active connectors
        const activeConnectors = await database.get(
            'SELECT COUNT(*) as count FROM connectors WHERE user_id = ? AND status = "active"',
            [req.user.id]
        );

        // Get recent connector activity
        const recentActivity = await database.all(
            `SELECT cl.*, c.name as connector_name 
             FROM connector_logs cl 
             INNER JOIN connectors c ON cl.connector_id = c.id 
             WHERE c.user_id = ? 
             ORDER BY cl.created_at DESC 
             LIMIT 10`,
            [req.user.id]
        );

        res.json({
            type_stats: typeStats,
            status_stats: statusStats,
            total_connectors: totalConnectors.count,
            active_connectors: activeConnectors.count,
            recent_activity: recentActivity,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Connector Routes', operation: 'getStats' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch connector statistics'
        });
    }
});

module.exports = router;

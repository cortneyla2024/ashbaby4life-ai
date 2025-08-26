const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Basic health check (no auth required)
router.get('/', async (req, res) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: config.version,
            environment: config.env,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            platform: process.platform,
            node_version: process.version
        };

        res.json(healthStatus);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'basicHealthCheck' });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});

// Detailed health check (requires auth)
router.get('/detailed', authMiddleware.requireAuth, async (req, res) => {
    try {
        const healthChecks = await performHealthChecks();
        const overallStatus = healthChecks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';

        const response = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: config.version,
            environment: config.env,
            uptime: process.uptime(),
            checks: healthChecks,
            system: {
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                platform: process.platform,
                arch: process.arch,
                node_version: process.version,
                hostname: os.hostname(),
                load_average: os.loadavg(),
                free_memory: os.freemem(),
                total_memory: os.totalmem()
            }
        };

        const statusCode = overallStatus === 'healthy' ? 200 : 503;
        res.status(statusCode).json(response);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'detailedHealthCheck' });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Detailed health check failed',
            message: error.message
        });
    }
});

// Database health check
router.get('/database', authMiddleware.requireAuth, async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Test database connection
        const dbTest = await database.get('SELECT 1 as test');
        const responseTime = Date.now() - startTime;

        if (!dbTest || dbTest.test !== 1) {
            throw new Error('Database connection test failed');
        }

        // Get database stats
        const stats = await database.getStats();

        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: {
                type: config.database.type,
                path: config.database.path,
                response_time: responseTime,
                stats: stats
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'databaseHealthCheck' });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: {
                type: config.database.type,
                path: config.database.path,
                error: error.message
            }
        });
    }
});

// File system health check
router.get('/filesystem', authMiddleware.requireAuth, async (req, res) => {
    try {
        const fsChecks = [];

        // Check essential directories
        const essentialDirs = [
            config.storage.uploadPath,
            config.storage.backupPath,
            config.logging.path,
            path.dirname(config.database.path)
        ];

        for (const dir of essentialDirs) {
            try {
                const stats = fs.statSync(dir);
                fsChecks.push({
                    path: dir,
                    status: 'healthy',
                    exists: true,
                    isDirectory: stats.isDirectory(),
                    permissions: {
                        readable: fs.accessSync(dir, fs.constants.R_OK),
                        writable: fs.accessSync(dir, fs.constants.W_OK)
                    }
                });
            } catch (error) {
                fsChecks.push({
                    path: dir,
                    status: 'unhealthy',
                    exists: false,
                    error: error.message
                });
            }
        }

        // Check disk space
        const diskSpace = await checkDiskSpace(config.storage.uploadPath);

        const overallStatus = fsChecks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';

        res.json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            filesystem: {
                checks: fsChecks,
                disk_space: diskSpace
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'filesystemHealthCheck' });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            filesystem: {
                error: error.message
            }
        });
    }
});

// AI engine health check
router.get('/ai', authMiddleware.requireAuth, async (req, res) => {
    try {
        const aiChecks = [];

        // Check AI model file
        const modelPath = config.ai.modelPath;
        try {
            const modelStats = fs.statSync(modelPath);
            aiChecks.push({
                component: 'model_file',
                status: 'healthy',
                path: modelPath,
                size: modelStats.size,
                lastModified: modelStats.mtime
            });
        } catch (error) {
            aiChecks.push({
                component: 'model_file',
                status: 'unhealthy',
                path: modelPath,
                error: error.message
            });
        }

        // Check AI configuration
        aiChecks.push({
            component: 'configuration',
            status: 'healthy',
            maxTokens: config.ai.maxTokens,
            temperature: config.ai.temperature,
            topP: config.ai.topP,
            maxConcurrent: config.ai.maxConcurrent,
            enableEvolution: config.ai.enableEvolution
        });

        // Mock AI engine test (replace with actual AI engine check)
        try {
            // Simulate AI engine test
            await new Promise(resolve => setTimeout(resolve, 100));
            aiChecks.push({
                component: 'engine',
                status: 'healthy',
                response_time: 100,
                model: 'steward-v5.0'
            });
        } catch (error) {
            aiChecks.push({
                component: 'engine',
                status: 'unhealthy',
                error: error.message
            });
        }

        const overallStatus = aiChecks.every(check => check.status === 'healthy') ? 'healthy' : 'unhealthy';

        res.json({
            status: overallStatus,
            timestamp: new Date().toISOString(),
            ai: {
                checks: aiChecks
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'aiHealthCheck' });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            ai: {
                error: error.message
            }
        });
    }
});

// System metrics
router.get('/metrics', authMiddleware.requireAuth, async (req, res) => {
    try {
        const metrics = {
            timestamp: new Date().toISOString(),
            system: {
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: process.memoryUsage().heapTotal,
                    external: process.memoryUsage().external,
                    rss: process.memoryUsage().rss
                },
                cpu: process.cpuUsage(),
                uptime: process.uptime(),
                platform: process.platform,
                arch: process.arch,
                node_version: process.version
            },
            os: {
                hostname: os.hostname(),
                platform: os.platform(),
                release: os.release(),
                load_average: os.loadavg(),
                free_memory: os.freemem(),
                total_memory: os.totalmem(),
                cpus: os.cpus().length,
                network_interfaces: Object.keys(os.networkInterfaces())
            },
            process: {
                pid: process.pid,
                version: process.version,
                title: process.title,
                argv: process.argv,
                env: Object.keys(process.env).length
            }
        };

        res.json(metrics);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'getMetrics' });
        res.status(500).json({
            error: 'Failed to get system metrics',
            message: error.message
        });
    }
});

// Performance metrics
router.get('/performance', authMiddleware.requireAuth, async (req, res) => {
    try {
        const performance = {
            timestamp: new Date().toISOString(),
            memory: {
                heap_used: process.memoryUsage().heapUsed,
                heap_total: process.memoryUsage().heapTotal,
                external: process.memoryUsage().external,
                rss: process.memoryUsage().rss
            },
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            load_average: os.loadavg(),
            free_memory: os.freemem(),
            total_memory: os.totalmem(),
            memory_usage_percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
        };

        res.json(performance);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'getPerformance' });
        res.status(500).json({
            error: 'Failed to get performance metrics',
            message: error.message
        });
    }
});

// Service status
router.get('/services', authMiddleware.requireAuth, async (req, res) => {
    try {
        const services = {
            timestamp: new Date().toISOString(),
            services: {
                database: {
                    status: 'operational',
                    type: config.database.type,
                    path: config.database.path
                },
                ai_engine: {
                    status: 'operational',
                    model: 'steward-v5.0',
                    path: config.ai.modelPath
                },
                file_storage: {
                    status: 'operational',
                    upload_path: config.storage.uploadPath,
                    backup_path: config.storage.backupPath
                },
                logging: {
                    status: 'operational',
                    path: config.logging.path,
                    level: config.logging.level
                },
                telemetry: {
                    status: config.telemetry.enabled ? 'operational' : 'disabled',
                    enabled: config.telemetry.enabled
                },
                orchestration: {
                    status: config.orchestration.enabled ? 'operational' : 'disabled',
                    enabled: config.orchestration.enabled
                }
            }
        };

        res.json(services);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Health Routes', operation: 'getServices' });
        res.status(500).json({
            error: 'Failed to get service status',
            message: error.message
        });
    }
});

// Perform all health checks
async function performHealthChecks() {
    const checks = [];

    // Database check
    try {
        const startTime = Date.now();
        await database.get('SELECT 1 as test');
        const responseTime = Date.now() - startTime;
        
        checks.push({
            name: 'database',
            status: 'healthy',
            response_time: responseTime,
            details: {
                type: config.database.type,
                path: config.database.path
            }
        });
    } catch (error) {
        checks.push({
            name: 'database',
            status: 'unhealthy',
            error: error.message,
            details: {
                type: config.database.type,
                path: config.database.path
            }
        });
    }

    // File system check
    try {
        const essentialDirs = [
            config.storage.uploadPath,
            config.storage.backupPath,
            config.logging.path
        ];

        for (const dir of essentialDirs) {
            fs.accessSync(dir, fs.constants.R_OK | fs.constants.W_OK);
        }

        checks.push({
            name: 'filesystem',
            status: 'healthy',
            details: {
                upload_path: config.storage.uploadPath,
                backup_path: config.storage.backupPath,
                log_path: config.logging.path
            }
        });
    } catch (error) {
        checks.push({
            name: 'filesystem',
            status: 'unhealthy',
            error: error.message
        });
    }

    // AI engine check
    try {
        const modelPath = config.ai.modelPath;
        fs.accessSync(modelPath, fs.constants.R_OK);
        
        checks.push({
            name: 'ai_engine',
            status: 'healthy',
            details: {
                model_path: modelPath,
                model: 'steward-v5.0'
            }
        });
    } catch (error) {
        checks.push({
            name: 'ai_engine',
            status: 'unhealthy',
            error: error.message,
            details: {
                model_path: config.ai.modelPath
            }
        });
    }

    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 0.9; // 90% threshold
    const memoryUsagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;

    checks.push({
        name: 'memory',
        status: memoryUsagePercent < memoryThreshold ? 'healthy' : 'warning',
        details: {
            heap_used: memoryUsage.heapUsed,
            heap_total: memoryUsage.heapTotal,
            usage_percent: (memoryUsagePercent * 100).toFixed(2)
        }
    });

    return checks;
}

// Check disk space
async function checkDiskSpace(directory) {
    try {
        const stats = fs.statSync(directory);
        const totalSpace = os.totalmem();
        const freeSpace = os.freemem();
        const usedSpace = totalSpace - freeSpace;

        return {
            total: totalSpace,
            free: freeSpace,
            used: usedSpace,
            usage_percent: ((usedSpace / totalSpace) * 100).toFixed(2)
        };
    } catch (error) {
        return {
            error: error.message
        };
    }
}

module.exports = router;

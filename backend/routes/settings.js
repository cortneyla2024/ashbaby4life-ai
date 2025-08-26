const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');

// Get all settings for the authenticated user
router.get('/', authMiddleware.requireAuth, async (req, res) => {
    try {
        const settings = await database.all(
            'SELECT category, key, value FROM settings WHERE user_id = ? ORDER BY category, key',
            [req.user.id]
        );

        // Group settings by category
        const groupedSettings = {};
        settings.forEach(setting => {
            if (!groupedSettings[setting.category]) {
                groupedSettings[setting.category] = {};
            }
            groupedSettings[setting.category][setting.key] = setting.value;
        });

        res.json({
            settings: groupedSettings,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'getSettings' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch settings'
        });
    }
});

// Get settings by category
router.get('/:category', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category } = req.params;

        const settings = await database.all(
            'SELECT key, value FROM settings WHERE user_id = ? AND category = ? ORDER BY key',
            [req.user.id, category]
        );

        const categorySettings = {};
        settings.forEach(setting => {
            categorySettings[setting.key] = setting.value;
        });

        res.json({
            category,
            settings: categorySettings,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'getSettingsByCategory' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch settings'
        });
    }
});

// Get a specific setting
router.get('/:category/:key', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category, key } = req.params;

        const setting = await database.get(
            'SELECT value FROM settings WHERE user_id = ? AND category = ? AND key = ?',
            [req.user.id, category, key]
        );

        if (!setting) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Setting not found',
                code: 'SETTING_NOT_FOUND'
            });
        }

        res.json({
            category,
            key,
            value: setting.value,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'getSetting' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch setting'
        });
    }
});

// Update a setting
router.put('/:category/:key', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category, key } = req.params;
        const { value } = req.body;

        if (value === undefined || value === null) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Value is required',
                code: 'MISSING_VALUE'
            });
        }

        // Validate setting value based on category and key
        const validationResult = validateSetting(category, key, value);
        if (!validationResult.isValid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid setting value',
                code: 'INVALID_VALUE',
                details: validationResult.errors
            });
        }

        const result = await database.run(
            `INSERT OR REPLACE INTO settings (user_id, category, key, value, updated_at)
             VALUES (?, ?, ?, ?, datetime("now"))`,
            [req.user.id, category, key, String(value)]
        );

        // Log setting update
        logger.userActivity(req.user.id, 'setting_updated', {
            category,
            key,
            value: String(value)
        });

        res.json({
            message: 'Setting updated successfully',
            category,
            key,
            value: String(value),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'updateSetting' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update setting'
        });
    }
});

// Update multiple settings
router.put('/:category', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category } = req.params;
        const settings = req.body;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Settings object is required',
                code: 'MISSING_SETTINGS'
            });
        }

        const updates = [];
        const errors = [];

        // Validate all settings
        for (const [key, value] of Object.entries(settings)) {
            const validationResult = validateSetting(category, key, value);
            if (!validationResult.isValid) {
                errors.push({
                    key,
                    errors: validationResult.errors
                });
            } else {
                updates.push({ key, value });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Some settings have invalid values',
                code: 'INVALID_SETTINGS',
                details: errors
            });
        }

        // Update all valid settings
        for (const { key, value } of updates) {
            await database.run(
                `INSERT OR REPLACE INTO settings (user_id, category, key, value, updated_at)
                 VALUES (?, ?, ?, ?, datetime("now"))`,
                [req.user.id, category, key, String(value)]
            );
        }

        // Log settings update
        logger.userActivity(req.user.id, 'settings_updated', {
            category,
            settings_count: updates.length,
            keys: updates.map(u => u.key)
        });

        res.json({
            message: 'Settings updated successfully',
            category,
            updated_count: updates.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'updateSettings' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update settings'
        });
    }
});

// Delete a setting
router.delete('/:category/:key', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category, key } = req.params;

        const result = await database.run(
            'DELETE FROM settings WHERE user_id = ? AND category = ? AND key = ?',
            [req.user.id, category, key]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Setting not found',
                code: 'SETTING_NOT_FOUND'
            });
        }

        // Log setting deletion
        logger.userActivity(req.user.id, 'setting_deleted', {
            category,
            key
        });

        res.json({
            message: 'Setting deleted successfully',
            category,
            key,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'deleteSetting' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete setting'
        });
    }
});

// Reset settings to defaults
router.post('/reset', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category } = req.body;

        if (category) {
            // Reset specific category
            await database.run(
                'DELETE FROM settings WHERE user_id = ? AND category = ?',
                [req.user.id, category]
            );

            logger.userActivity(req.user.id, 'settings_reset', {
                category
            });

            res.json({
                message: 'Settings reset to defaults',
                category,
                timestamp: new Date().toISOString()
            });
        } else {
            // Reset all settings
            await database.run(
                'DELETE FROM settings WHERE user_id = ?',
                [req.user.id]
            );

            logger.userActivity(req.user.id, 'all_settings_reset');

            res.json({
                message: 'All settings reset to defaults',
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'resetSettings' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to reset settings'
        });
    }
});

// Export settings
router.get('/export/all', authMiddleware.requireAuth, async (req, res) => {
    try {
        const settings = await database.all(
            'SELECT category, key, value, created_at, updated_at FROM settings WHERE user_id = ? ORDER BY category, key',
            [req.user.id]
        );

        const exportData = {
            export_date: new Date().toISOString(),
            user_id: req.user.id,
            settings_count: settings.length,
            settings: settings
        };

        // Log export
        logger.userActivity(req.user.id, 'settings_exported', {
            settings_count: settings.length
        });

        res.json(exportData);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'exportSettings' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to export settings'
        });
    }
});

// Import settings
router.post('/import', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { settings, overwrite = false } = req.body;

        if (!settings || !Array.isArray(settings)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Settings array is required',
                code: 'MISSING_SETTINGS'
            });
        }

        let importedCount = 0;
        let skippedCount = 0;
        const errors = [];

        for (const setting of settings) {
            try {
                const { category, key, value } = setting;

                if (!category || !key || value === undefined) {
                    errors.push({
                        setting,
                        error: 'Missing required fields'
                    });
                    continue;
                }

                // Validate setting
                const validationResult = validateSetting(category, key, value);
                if (!validationResult.isValid) {
                    errors.push({
                        setting,
                        error: validationResult.errors
                    });
                    continue;
                }

                // Check if setting exists
                const existing = await database.get(
                    'SELECT id FROM settings WHERE user_id = ? AND category = ? AND key = ?',
                    [req.user.id, category, key]
                );

                if (existing && !overwrite) {
                    skippedCount++;
                    continue;
                }

                // Insert or update setting
                await database.run(
                    `INSERT OR REPLACE INTO settings (user_id, category, key, value, updated_at)
                     VALUES (?, ?, ?, ?, datetime("now"))`,
                    [req.user.id, category, key, String(value)]
                );

                importedCount++;

            } catch (error) {
                errors.push({
                    setting,
                    error: error.message
                });
            }
        }

        // Log import
        logger.userActivity(req.user.id, 'settings_imported', {
            imported_count: importedCount,
            skipped_count: skippedCount,
            error_count: errors.length
        });

        res.json({
            message: 'Settings import completed',
            imported_count: importedCount,
            skipped_count: skippedCount,
            error_count: errors.length,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'importSettings' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to import settings'
        });
    }
});

// Get available setting categories
router.get('/categories/available', authMiddleware.requireAuth, async (req, res) => {
    try {
        const categories = [
            {
                name: 'general',
                description: 'General application settings',
                settings: [
                    { key: 'theme', type: 'string', options: ['light', 'dark', 'system'] },
                    { key: 'language', type: 'string', options: ['en', 'es', 'fr', 'de'] },
                    { key: 'timezone', type: 'string' },
                    { key: 'date_format', type: 'string' },
                    { key: 'time_format', type: 'string', options: ['12h', '24h'] }
                ]
            },
            {
                name: 'notifications',
                description: 'Notification preferences',
                settings: [
                    { key: 'email_enabled', type: 'boolean' },
                    { key: 'push_enabled', type: 'boolean' },
                    { key: 'sound_enabled', type: 'boolean' },
                    { key: 'daily_summary', type: 'boolean' },
                    { key: 'weekly_report', type: 'boolean' }
                ]
            },
            {
                name: 'privacy',
                description: 'Privacy and data settings',
                settings: [
                    { key: 'data_collection', type: 'boolean' },
                    { key: 'analytics', type: 'boolean' },
                    { key: 'auto_logout', type: 'boolean' },
                    { key: 'session_timeout', type: 'number', min: 5, max: 480 }
                ]
            },
            {
                name: 'ai',
                description: 'AI and automation settings',
                settings: [
                    { key: 'personality', type: 'string', options: ['friendly', 'professional', 'casual', 'formal'] },
                    { key: 'response_length', type: 'string', options: ['short', 'medium', 'long'] },
                    { key: 'creativity', type: 'string', options: ['low', 'medium', 'high'] },
                    { key: 'auto_suggestions', type: 'boolean' }
                ]
            },
            {
                name: 'performance',
                description: 'Performance and optimization settings',
                settings: [
                    { key: 'enable_caching', type: 'boolean' },
                    { key: 'enable_compression', type: 'boolean' },
                    { key: 'max_memory_usage', type: 'number', min: 512, max: 8192 },
                    { key: 'auto_cleanup', type: 'boolean' }
                ]
            }
        ];

        res.json({
            categories,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Settings Routes', operation: 'getCategories' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch categories'
        });
    }
});

// Validate setting value
function validateSetting(category, key, value) {
    const errors = [];

    // Category-specific validation
    switch (category) {
        case 'general':
            if (key === 'theme' && !['light', 'dark', 'system'].includes(value)) {
                errors.push('Theme must be light, dark, or system');
            }
            if (key === 'language' && !['en', 'es', 'fr', 'de'].includes(value)) {
                errors.push('Language must be en, es, fr, or de');
            }
            if (key === 'time_format' && !['12h', '24h'].includes(value)) {
                errors.push('Time format must be 12h or 24h');
            }
            break;

        case 'notifications':
            if (typeof value !== 'boolean') {
                errors.push('Notification settings must be boolean');
            }
            break;

        case 'privacy':
            if (key === 'session_timeout') {
                const timeout = parseInt(value);
                if (isNaN(timeout) || timeout < 5 || timeout > 480) {
                    errors.push('Session timeout must be between 5 and 480 minutes');
                }
            } else if (typeof value !== 'boolean') {
                errors.push('Privacy settings must be boolean');
            }
            break;

        case 'ai':
            if (key === 'personality' && !['friendly', 'professional', 'casual', 'formal'].includes(value)) {
                errors.push('Personality must be friendly, professional, casual, or formal');
            }
            if (key === 'response_length' && !['short', 'medium', 'long'].includes(value)) {
                errors.push('Response length must be short, medium, or long');
            }
            if (key === 'creativity' && !['low', 'medium', 'high'].includes(value)) {
                errors.push('Creativity must be low, medium, or high');
            }
            break;

        case 'performance':
            if (key === 'max_memory_usage') {
                const memory = parseInt(value);
                if (isNaN(memory) || memory < 512 || memory > 8192) {
                    errors.push('Max memory usage must be between 512 and 8192 MB');
                }
            } else if (typeof value !== 'boolean') {
                errors.push('Performance settings must be boolean');
            }
            break;

        default:
            // Allow any value for unknown categories
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = router;

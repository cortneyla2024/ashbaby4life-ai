const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');

// Get all creative projects for a user
router.get('/projects', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { status, category, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM creative_projects WHERE user_id = ?';
        const params = [req.user.id];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const projects = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM creative_projects WHERE user_id = ?';
        const countParams = [req.user.id];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            projects,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'getProjects' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch creative projects'
        });
    }
});

// Get a specific creative project
router.get('/projects/:projectId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await database.get(
            'SELECT * FROM creative_projects WHERE id = ? AND user_id = ?',
            [projectId, req.user.id]
        );

        if (!project) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Creative project not found',
                code: 'PROJECT_NOT_FOUND'
            });
        }

        // Get project files
        const files = await database.all(
            'SELECT * FROM files WHERE project_id = ? AND user_id = ? ORDER BY created_at ASC',
            [projectId, req.user.id]
        );

        res.json({
            project,
            files,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'getProject' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch creative project'
        });
    }
});

// Create a new creative project
router.post('/projects', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { title, description, category, tags, inspiration, goals } = req.body;

        // Validate required fields
        if (!title || !category) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Title and category are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate category
        const validCategories = ['art', 'writing', 'music', 'design', 'photography', 'craft', 'other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid category',
                code: 'INVALID_CATEGORY',
                valid_categories: validCategories
            });
        }

        const result = await database.run(
            `INSERT INTO creative_projects (
                user_id, title, description, category, tags, inspiration, goals, 
                status, progress, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                req.user.id, title, description || '', category, 
                tags ? JSON.stringify(tags) : null,
                inspiration || '', goals ? JSON.stringify(goals) : null,
                'planning', 0
            ]
        );

        const newProject = await database.get(
            'SELECT * FROM creative_projects WHERE id = ?',
            [result.lastID]
        );

        // Log project creation
        logger.userActivity(req.user.id, 'creative_project_created', {
            project_id: result.lastID,
            category,
            title
        });

        res.status(201).json({
            project: newProject,
            message: 'Creative project created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'createProject' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create creative project'
        });
    }
});

// Update a creative project
router.put('/projects/:projectId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description, category, tags, inspiration, goals, status, progress } = req.body;

        // Check if project exists and belongs to user
        const existingProject = await database.get(
            'SELECT * FROM creative_projects WHERE id = ? AND user_id = ?',
            [projectId, req.user.id]
        );

        if (!existingProject) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Creative project not found',
                code: 'PROJECT_NOT_FOUND'
            });
        }

        // Validate category if provided
        if (category) {
            const validCategories = ['art', 'writing', 'music', 'design', 'photography', 'craft', 'other'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid category',
                    code: 'INVALID_CATEGORY'
                });
            }
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['planning', 'in_progress', 'review', 'completed', 'paused', 'abandoned'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid status',
                    code: 'INVALID_STATUS'
                });
            }
        }

        // Validate progress if provided
        if (progress !== undefined && (progress < 0 || progress > 100)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Progress must be between 0 and 100',
                code: 'INVALID_PROGRESS'
            });
        }

        const updateFields = [];
        const params = [];

        if (title !== undefined) {
            updateFields.push('title = ?');
            params.push(title);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }

        if (category !== undefined) {
            updateFields.push('category = ?');
            params.push(category);
        }

        if (tags !== undefined) {
            updateFields.push('tags = ?');
            params.push(JSON.stringify(tags));
        }

        if (inspiration !== undefined) {
            updateFields.push('inspiration = ?');
            params.push(inspiration);
        }

        if (goals !== undefined) {
            updateFields.push('goals = ?');
            params.push(JSON.stringify(goals));
        }

        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }

        if (progress !== undefined) {
            updateFields.push('progress = ?');
            params.push(progress);
        }

        updateFields.push('updated_at = datetime("now")');
        params.push(projectId, req.user.id);

        const query = `UPDATE creative_projects SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
        await database.run(query, params);

        const updatedProject = await database.get(
            'SELECT * FROM creative_projects WHERE id = ?',
            [projectId]
        );

        // Log project update
        logger.userActivity(req.user.id, 'creative_project_updated', {
            project_id: projectId,
            updated_fields: Object.keys(req.body)
        });

        res.json({
            project: updatedProject,
            message: 'Creative project updated successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'updateProject' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update creative project'
        });
    }
});

// Delete a creative project
router.delete('/projects/:projectId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;

        // Check if project exists and belongs to user
        const project = await database.get(
            'SELECT * FROM creative_projects WHERE id = ? AND user_id = ?',
            [projectId, req.user.id]
        );

        if (!project) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Creative project not found',
                code: 'PROJECT_NOT_FOUND'
            });
        }

        // Delete project files first
        await database.run(
            'DELETE FROM files WHERE project_id = ? AND user_id = ?',
            [projectId, req.user.id]
        );

        // Delete the project
        await database.run(
            'DELETE FROM creative_projects WHERE id = ? AND user_id = ?',
            [projectId, req.user.id]
        );

        // Log project deletion
        logger.userActivity(req.user.id, 'creative_project_deleted', {
            project_id: projectId,
            project_title: project.title
        });

        res.json({
            message: 'Creative project deleted successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'deleteProject' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete creative project'
        });
    }
});

// Get creativity statistics
router.get('/stats', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let timeFilter = '';
        switch (period) {
            case '7d':
                timeFilter = 'AND created_at > datetime("now", "-7 days")';
                break;
            case '30d':
                timeFilter = 'AND created_at > datetime("now", "-30 days")';
                break;
            case '90d':
                timeFilter = 'AND created_at > datetime("now", "-90 days")';
                break;
            default:
                timeFilter = 'AND created_at > datetime("now", "-30 days")';
        }

        // Get project counts by category
        const categoryStats = await database.all(
            `SELECT category, COUNT(*) as count, AVG(progress) as avg_progress
             FROM creative_projects 
             WHERE user_id = ? ${timeFilter}
             GROUP BY category`,
            [req.user.id]
        );

        // Get project counts by status
        const statusStats = await database.all(
            `SELECT status, COUNT(*) as count
             FROM creative_projects 
             WHERE user_id = ? ${timeFilter}
             GROUP BY status`,
            [req.user.id]
        );

        // Get recent activity
        const recentActivity = await database.all(
            `SELECT * FROM creative_projects 
             WHERE user_id = ? ${timeFilter}
             ORDER BY updated_at DESC 
             LIMIT 5`,
            [req.user.id]
        );

        // Get total projects and average progress
        const totalStats = await database.get(
            `SELECT COUNT(*) as total_projects, AVG(progress) as overall_progress
             FROM creative_projects 
             WHERE user_id = ? ${timeFilter}`,
            [req.user.id]
        );

        res.json({
            period,
            category_stats: categoryStats,
            status_stats: statusStats,
            recent_activity: recentActivity,
            total_projects: totalStats.total_projects || 0,
            overall_progress: totalStats.overall_progress || 0,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'getStats' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch creativity statistics'
        });
    }
});

// Get creative inspiration
router.get('/inspiration', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category, limit = 10 } = req.query;

        // Mock inspiration data - in a real implementation, this would come from a database or AI
        const inspirationData = {
            art: [
                { title: 'Abstract Expressionism', description: 'Explore emotions through color and form', prompt: 'Create an abstract piece using only three colors that represent your current mood' },
                { title: 'Nature Photography', description: 'Capture the beauty of the natural world', prompt: 'Take a photo that shows the contrast between light and shadow in nature' },
                { title: 'Digital Art', description: 'Create stunning visuals using digital tools', prompt: 'Design a futuristic cityscape with sustainable architecture' }
            ],
            writing: [
                { title: 'Micro Fiction', description: 'Tell a complete story in 100 words or less', prompt: 'Write a story that begins and ends with the same sentence' },
                { title: 'Poetry', description: 'Express emotions through verse', prompt: 'Write a poem about a moment of transformation' },
                { title: 'Creative Nonfiction', description: 'Tell true stories with creative flair', prompt: 'Describe a childhood memory using all five senses' }
            ],
            music: [
                { title: 'Ambient Soundscapes', description: 'Create atmospheric musical environments', prompt: 'Compose a piece that evokes the feeling of walking through a forest at dawn' },
                { title: 'Rhythm Exploration', description: 'Experiment with different rhythmic patterns', prompt: 'Create a rhythm using only household objects as instruments' },
                { title: 'Melody Writing', description: 'Craft memorable musical phrases', prompt: 'Write a melody that tells a story without words' }
            ],
            design: [
                { title: 'Minimalist Design', description: 'Less is more in visual communication', prompt: 'Design a logo using only geometric shapes and one color' },
                { title: 'Typography Art', description: 'Use letters as visual elements', prompt: 'Create a poster where the text forms an image' },
                { title: 'Color Theory', description: 'Master the psychology of color', prompt: 'Design a mood board using only complementary colors' }
            ]
        };

        let inspiration = [];
        if (category && inspirationData[category]) {
            inspiration = inspirationData[category].slice(0, parseInt(limit));
        } else {
            // Return random inspiration from all categories
            const allInspiration = Object.values(inspirationData).flat();
            inspiration = allInspiration.sort(() => Math.random() - 0.5).slice(0, parseInt(limit));
        }

        res.json({
            inspiration,
            category: category || 'all',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'getInspiration' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch creative inspiration'
        });
    }
});

// Get creative prompts
router.get('/prompts', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category, difficulty, limit = 5 } = req.query;

        // Mock prompts data - in a real implementation, this would come from a database or AI
        const promptsData = {
            art: {
                easy: [
                    'Draw a simple landscape using only three colors',
                    'Create a self-portrait using only geometric shapes',
                    'Paint your favorite season using abstract forms'
                ],
                medium: [
                    'Design a character that represents your inner self',
                    'Create a piece that shows the passage of time',
                    'Illustrate a dream you had recently'
                ],
                hard: [
                    'Create a visual representation of a complex emotion',
                    'Design a piece that challenges societal norms',
                    'Illustrate the concept of infinity'
                ]
            },
            writing: {
                easy: [
                    'Write a story about a magical object you found',
                    'Describe your perfect day in detail',
                    'Create a character based on someone you know'
                ],
                medium: [
                    'Write a story that takes place in one room',
                    'Create a dialogue between two people who disagree',
                    'Write about a moment that changed everything'
                ],
                hard: [
                    'Write a story from multiple perspectives',
                    'Create a narrative without using the letter "e"',
                    'Write about the same event from three different time periods'
                ]
            },
            music: {
                easy: [
                    'Create a melody using only five notes',
                    'Compose a piece inspired by rain',
                    'Write a song about your hometown'
                ],
                medium: [
                    'Create a piece that tells a story without words',
                    'Compose music for a specific emotion',
                    'Write a song from an unusual perspective'
                ],
                hard: [
                    'Create a piece using only silence and one instrument',
                    'Compose music that represents a mathematical concept',
                    'Write a song that changes genre halfway through'
                ]
            }
        };

        let prompts = [];
        if (category && promptsData[category]) {
            if (difficulty && promptsData[category][difficulty]) {
                prompts = promptsData[category][difficulty];
            } else {
                prompts = Object.values(promptsData[category]).flat();
            }
        } else {
            // Return random prompts from all categories
            const allPrompts = Object.values(promptsData).flatMap(cat => Object.values(cat).flat());
            prompts = allPrompts;
        }

        // Shuffle and limit
        prompts = prompts.sort(() => Math.random() - 0.5).slice(0, parseInt(limit));

        res.json({
            prompts,
            category: category || 'all',
            difficulty: difficulty || 'all',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'getPrompts' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch creative prompts'
        });
    }
});

// Get creative tools and resources
router.get('/tools', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category } = req.query;

        // Mock tools data - in a real implementation, this would come from a database
        const toolsData = {
            art: [
                { name: 'Digital Drawing Tablet', description: 'Essential for digital art creation', type: 'hardware' },
                { name: 'Procreate', description: 'Professional drawing app for iPad', type: 'software' },
                { name: 'Adobe Creative Suite', description: 'Industry standard creative software', type: 'software' },
                { name: 'Color Wheel', description: 'Tool for understanding color relationships', type: 'reference' }
            ],
            writing: [
                { name: 'Scrivener', description: 'Professional writing software', type: 'software' },
                { name: 'Grammarly', description: 'Writing assistant and grammar checker', type: 'software' },
                { name: 'Writing Prompts Generator', description: 'AI-powered prompt generation', type: 'tool' },
                { name: 'Thesaurus', description: 'Expand your vocabulary', type: 'reference' }
            ],
            music: [
                { name: 'GarageBand', description: 'Free music creation software', type: 'software' },
                { name: 'Ableton Live', description: 'Professional music production software', type: 'software' },
                { name: 'Metronome', description: 'Keep time while practicing', type: 'tool' },
                { name: 'Chord Progression Chart', description: 'Reference for music theory', type: 'reference' }
            ],
            design: [
                { name: 'Figma', description: 'Collaborative design tool', type: 'software' },
                { name: 'Canva', description: 'Easy-to-use design platform', type: 'software' },
                { name: 'Color Palette Generator', description: 'Create harmonious color schemes', type: 'tool' },
                { name: 'Typography Guide', description: 'Learn about fonts and typography', type: 'reference' }
            ]
        };

        let tools = [];
        if (category && toolsData[category]) {
            tools = toolsData[category];
        } else {
            tools = Object.values(toolsData).flat();
        }

        res.json({
            tools,
            category: category || 'all',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Creativity Routes', operation: 'getTools' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch creative tools'
        });
    }
});

module.exports = router;

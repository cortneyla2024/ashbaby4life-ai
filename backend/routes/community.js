const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');

// Get community overview
router.get('/overview', authMiddleware.requireAuth, async (req, res) => {
    try {
        // Get user's community groups
        const userGroups = await database.all(
            `SELECT cg.*, cgm.role, cgm.joined_at 
             FROM community_groups cg 
             INNER JOIN community_group_members cgm ON cg.id = cgm.group_id 
             WHERE cgm.user_id = ? 
             ORDER BY cgm.joined_at DESC`,
            [req.user.id]
        );

        // Get recent community activity
        const recentActivity = await database.all(
            `SELECT * FROM community_activity 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 10`,
            [req.user.id]
        );

        // Get upcoming events
        const upcomingEvents = await database.all(
            `SELECT ce.*, cg.name as group_name 
             FROM community_events ce 
             INNER JOIN community_groups cg ON ce.group_id = cg.id 
             INNER JOIN community_group_members cgm ON cg.id = cgm.group_id 
             WHERE cgm.user_id = ? AND ce.event_date >= date('now') 
             ORDER BY ce.event_date ASC 
             LIMIT 5`,
            [req.user.id]
        );

        // Get user connections
        const connections = await database.all(
            `SELECT * FROM user_connections 
             WHERE (user_id = ? OR connected_user_id = ?) 
             ORDER BY created_at DESC`,
            [req.user.id, req.user.id]
        );

        const overview = {
            user_groups: userGroups,
            recent_activity: recentActivity,
            upcoming_events: upcomingEvents,
            connections: connections,
            timestamp: new Date().toISOString()
        };

        res.json(overview);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'getOverview' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch community overview'
        });
    }
});

// Get all community groups
router.get('/groups', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { category, status, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM community_groups WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const groups = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM community_groups WHERE 1=1';
        const countParams = [];

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const totalCount = await database.get(countQuery, countParams);

        // Get membership status for each group
        const groupsWithMembership = await Promise.all(
            groups.map(async (group) => {
                const membership = await database.get(
                    'SELECT * FROM community_group_members WHERE group_id = ? AND user_id = ?',
                    [group.id, req.user.id]
                );

                const memberCount = await database.get(
                    'SELECT COUNT(*) as count FROM community_group_members WHERE group_id = ?',
                    [group.id]
                );

                return {
                    ...group,
                    is_member: !!membership,
                    membership_role: membership ? membership.role : null,
                    member_count: memberCount.count
                };
            })
        );

        res.json({
            groups: groupsWithMembership,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'getGroups' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch community groups'
        });
    }
});

// Get a specific community group
router.get('/groups/:groupId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await database.get(
            'SELECT * FROM community_groups WHERE id = ?',
            [groupId]
        );

        if (!group) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Community group not found',
                code: 'GROUP_NOT_FOUND'
            });
        }

        // Get group members
        const members = await database.all(
            `SELECT u.id, u.username, u.email, cgm.role, cgm.joined_at 
             FROM community_group_members cgm 
             INNER JOIN users u ON cgm.user_id = u.id 
             WHERE cgm.group_id = ? 
             ORDER BY cgm.joined_at ASC`,
            [groupId]
        );

        // Get group events
        const events = await database.all(
            'SELECT * FROM community_events WHERE group_id = ? ORDER BY event_date ASC',
            [groupId]
        );

        // Check if user is a member
        const userMembership = await database.get(
            'SELECT * FROM community_group_members WHERE group_id = ? AND user_id = ?',
            [groupId, req.user.id]
        );

        res.json({
            group,
            members,
            events,
            is_member: !!userMembership,
            membership_role: userMembership ? userMembership.role : null,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'getGroup' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch community group'
        });
    }
});

// Create a new community group
router.post('/groups', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { name, description, category, privacy, rules, tags } = req.body;

        // Validate required fields
        if (!name || !category) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Name and category are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate category
        const validCategories = ['health', 'creativity', 'finance', 'technology', 'education', 'social', 'other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid category',
                code: 'INVALID_CATEGORY',
                valid_categories: validCategories
            });
        }

        // Validate privacy setting
        const validPrivacy = ['public', 'private', 'invite_only'];
        if (privacy && !validPrivacy.includes(privacy)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid privacy setting',
                code: 'INVALID_PRIVACY',
                valid_privacy: validPrivacy
            });
        }

        const result = await database.run(
            `INSERT INTO community_groups (
                name, description, category, privacy, rules, tags, 
                created_by, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                name, description || '', category, privacy || 'public',
                rules ? JSON.stringify(rules) : null,
                tags ? JSON.stringify(tags) : null,
                req.user.id, 'active'
            ]
        );

        // Add creator as admin member
        await database.run(
            `INSERT INTO community_group_members (
                group_id, user_id, role, joined_at
            ) VALUES (?, ?, ?, datetime('now'))`,
            [result.lastID, req.user.id, 'admin']
        );

        const newGroup = await database.get(
            'SELECT * FROM community_groups WHERE id = ?',
            [result.lastID]
        );

        // Log group creation
        logger.userActivity(req.user.id, 'community_group_created', {
            group_id: result.lastID,
            group_name: name,
            category
        });

        res.status(201).json({
            group: newGroup,
            message: 'Community group created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'createGroup' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create community group'
        });
    }
});

// Join a community group
router.post('/groups/:groupId/join', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Check if group exists
        const group = await database.get(
            'SELECT * FROM community_groups WHERE id = ?',
            [groupId]
        );

        if (!group) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Community group not found',
                code: 'GROUP_NOT_FOUND'
            });
        }

        // Check if user is already a member
        const existingMembership = await database.get(
            'SELECT * FROM community_group_members WHERE group_id = ? AND user_id = ?',
            [groupId, req.user.id]
        );

        if (existingMembership) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Already a member of this group',
                code: 'ALREADY_MEMBER'
            });
        }

        // Check privacy settings
        if (group.privacy === 'invite_only') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'This group requires an invitation to join',
                code: 'INVITE_REQUIRED'
            });
        }

        const result = await database.run(
            `INSERT INTO community_group_members (
                group_id, user_id, role, joined_at
            ) VALUES (?, ?, ?, datetime('now'))`,
            [groupId, req.user.id, 'member']
        );

        // Log group join
        logger.userActivity(req.user.id, 'community_group_joined', {
            group_id: groupId,
            group_name: group.name
        });

        res.status(201).json({
            message: 'Successfully joined community group',
            membership_id: result.lastID,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'joinGroup' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to join community group'
        });
    }
});

// Leave a community group
router.delete('/groups/:groupId/leave', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { groupId } = req.params;

        // Check if user is a member
        const membership = await database.get(
            'SELECT * FROM community_group_members WHERE group_id = ? AND user_id = ?',
            [groupId, req.user.id]
        );

        if (!membership) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Not a member of this group',
                code: 'NOT_MEMBER'
            });
        }

        // Check if user is the creator (admin)
        if (membership.role === 'admin') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Group creator cannot leave the group. Transfer ownership or delete the group instead.',
                code: 'CREATOR_CANNOT_LEAVE'
            });
        }

        await database.run(
            'DELETE FROM community_group_members WHERE group_id = ? AND user_id = ?',
            [groupId, req.user.id]
        );

        // Log group leave
        logger.userActivity(req.user.id, 'community_group_left', {
            group_id: groupId
        });

        res.json({
            message: 'Successfully left community group',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'leaveGroup' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to leave community group'
        });
    }
});

// Get community events
router.get('/events', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { groupId, status, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT ce.*, cg.name as group_name FROM community_events ce INNER JOIN community_groups cg ON ce.group_id = cg.id WHERE 1=1';
        const params = [];

        if (groupId) {
            query += ' AND ce.group_id = ?';
            params.push(groupId);
        }

        if (status) {
            query += ' AND ce.status = ?';
            params.push(status);
        }

        query += ' ORDER BY ce.event_date ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const events = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM community_events WHERE 1=1';
        const countParams = [];

        if (groupId) {
            countQuery += ' AND group_id = ?';
            countParams.push(groupId);
        }

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'getEvents' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch community events'
        });
    }
});

// Create a new community event
router.post('/events', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { groupId, title, description, eventDate, eventTime, location, maxParticipants } = req.body;

        // Validate required fields
        if (!groupId || !title || !eventDate) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Group ID, title, and event date are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Check if group exists and user is a member
        const group = await database.get(
            'SELECT * FROM community_groups WHERE id = ?',
            [groupId]
        );

        if (!group) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Community group not found',
                code: 'GROUP_NOT_FOUND'
            });
        }

        const membership = await database.get(
            'SELECT * FROM community_group_members WHERE group_id = ? AND user_id = ?',
            [groupId, req.user.id]
        );

        if (!membership) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Must be a member of the group to create events',
                code: 'NOT_MEMBER'
            });
        }

        const result = await database.run(
            `INSERT INTO community_events (
                group_id, title, description, event_date, event_time, location, 
                max_participants, created_by, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
                groupId, title, description || '', eventDate, eventTime || '',
                location || '', maxParticipants || null, req.user.id, 'active'
            ]
        );

        const newEvent = await database.get(
            'SELECT * FROM community_events WHERE id = ?',
            [result.lastID]
        );

        // Log event creation
        logger.userActivity(req.user.id, 'community_event_created', {
            event_id: result.lastID,
            group_id: groupId,
            event_title: title
        });

        res.status(201).json({
            event: newEvent,
            message: 'Community event created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'createEvent' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create community event'
        });
    }
});

// Get user connections
router.get('/connections', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = `SELECT uc.*, 
                            u1.username as user_username, u1.email as user_email,
                            u2.username as connected_username, u2.email as connected_email
                     FROM user_connections uc 
                     INNER JOIN users u1 ON uc.user_id = u1.id 
                     INNER JOIN users u2 ON uc.connected_user_id = u2.id 
                     WHERE (uc.user_id = ? OR uc.connected_user_id = ?)`;
        const params = [req.user.id, req.user.id];

        if (status) {
            query += ' AND uc.status = ?';
            params.push(status);
        }

        query += ' ORDER BY uc.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const connections = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM user_connections WHERE (user_id = ? OR connected_user_id = ?)';
        const countParams = [req.user.id, req.user.id];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            connections,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'getConnections' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch user connections'
        });
    }
});

// Send connection request
router.post('/connections', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectedUserId, message } = req.body;

        // Validate required fields
        if (!connectedUserId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Connected user ID is required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Check if user exists
        const connectedUser = await database.get(
            'SELECT * FROM users WHERE id = ?',
            [connectedUserId]
        );

        if (!connectedUser) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Check if connection already exists
        const existingConnection = await database.get(
            'SELECT * FROM user_connections WHERE (user_id = ? AND connected_user_id = ?) OR (user_id = ? AND connected_user_id = ?)',
            [req.user.id, connectedUserId, connectedUserId, req.user.id]
        );

        if (existingConnection) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Connection already exists',
                code: 'CONNECTION_EXISTS'
            });
        }

        const result = await database.run(
            `INSERT INTO user_connections (
                user_id, connected_user_id, status, message, created_at
            ) VALUES (?, ?, ?, ?, datetime('now'))`,
            [req.user.id, connectedUserId, 'pending', message || '']
        );

        // Log connection request
        logger.userActivity(req.user.id, 'connection_request_sent', {
            connection_id: result.lastID,
            connected_user_id: connectedUserId
        });

        res.status(201).json({
            message: 'Connection request sent successfully',
            connection_id: result.lastID,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'sendConnectionRequest' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to send connection request'
        });
    }
});

// Accept/Reject connection request
router.put('/connections/:connectionId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { action } = req.body; // 'accept' or 'reject'

        if (!action || !['accept', 'reject'].includes(action)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Action must be "accept" or "reject"',
                code: 'INVALID_ACTION'
            });
        }

        // Check if connection request exists and is for this user
        const connection = await database.get(
            'SELECT * FROM user_connections WHERE id = ? AND connected_user_id = ? AND status = "pending"',
            [connectionId, req.user.id]
        );

        if (!connection) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Connection request not found',
                code: 'CONNECTION_NOT_FOUND'
            });
        }

        const newStatus = action === 'accept' ? 'accepted' : 'rejected';
        await database.run(
            'UPDATE user_connections SET status = ?, updated_at = datetime("now") WHERE id = ?',
            [newStatus, connectionId]
        );

        // Log connection action
        logger.userActivity(req.user.id, `connection_request_${action}ed`, {
            connection_id: connectionId,
            user_id: connection.user_id
        });

        res.json({
            message: `Connection request ${action}ed successfully`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'updateConnection' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update connection request'
        });
    }
});

// Get community statistics
router.get('/stats', authMiddleware.requireAuth, async (req, res) => {
    try {
        // Get user's group statistics
        const groupStats = await database.get(
            'SELECT COUNT(*) as total_groups FROM community_group_members WHERE user_id = ?',
            [req.user.id]
        );

        // Get user's event statistics
        const eventStats = await database.get(
            'SELECT COUNT(*) as total_events FROM community_events WHERE created_by = ?',
            [req.user.id]
        );

        // Get user's connection statistics
        const connectionStats = await database.get(
            'SELECT COUNT(*) as total_connections FROM user_connections WHERE (user_id = ? OR connected_user_id = ?) AND status = "accepted"',
            [req.user.id, req.user.id]
        );

        // Get pending connection requests
        const pendingRequests = await database.get(
            'SELECT COUNT(*) as pending_requests FROM user_connections WHERE connected_user_id = ? AND status = "pending"',
            [req.user.id]
        );

        res.json({
            group_stats: groupStats,
            event_stats: eventStats,
            connection_stats: connectionStats,
            pending_requests: pendingRequests,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Community Routes', operation: 'getStats' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch community statistics'
        });
    }
});

module.exports = router;

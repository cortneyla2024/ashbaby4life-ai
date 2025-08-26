const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');

// User registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Username and password are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate password strength
        const passwordValidation = authMiddleware.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Password does not meet requirements',
                code: 'WEAK_PASSWORD',
                details: passwordValidation.errors
            });
        }

        // Validate email if provided
        if (email && !authMiddleware.validateEmail(email)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid email format',
                code: 'INVALID_EMAIL'
            });
        }

        // Check if username already exists
        const existingUser = await database.get(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUser) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'Username already exists',
                code: 'USERNAME_EXISTS'
            });
        }

        // Check if email already exists
        if (email) {
            const existingEmail = await database.get(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingEmail) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Email already exists',
                    code: 'EMAIL_EXISTS'
                });
            }
        }

        // Hash password
        const hashedPassword = await authMiddleware.hashPassword(password);

        // Create user
        const result = await database.run(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))`,
            [username, email || null, hashedPassword, firstName || null, lastName || null]
        );

        const user = await database.get(
            'SELECT id, username, email, first_name, last_name, created_at FROM users WHERE id = ?',
            [result.lastID]
        );

        // Log registration
        logger.userActivity(user.id, 'user_registered', {
            username: user.username,
            email: user.email
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'register' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to register user'
        });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const clientIP = req.ip || req.connection.remoteAddress;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Username and password are required',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Check for account lockout
        if (authMiddleware.checkLoginAttempts(clientIP)) {
            const lockoutExpiry = authMiddleware.lockoutTime.get(clientIP);
            const remainingTime = Math.ceil((lockoutExpiry - Date.now()) / 1000);
            
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `Account temporarily locked. Try again in ${remainingTime} seconds.`,
                code: 'ACCOUNT_LOCKED',
                retryAfter: remainingTime
            });
        }

        // Get user
        const user = await database.get(
            'SELECT * FROM users WHERE username = ? AND is_active = 1',
            [username]
        );

        if (!user) {
            authMiddleware.recordFailedLogin(clientIP);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid username or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Verify password
        const isValidPassword = await authMiddleware.comparePassword(password, user.password_hash);

        if (!isValidPassword) {
            authMiddleware.recordFailedLogin(clientIP);
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid username or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Clear failed login attempts
        authMiddleware.clearLoginAttempts(clientIP);

        // Generate tokens
        const token = authMiddleware.generateToken(user.id);
        const refreshToken = authMiddleware.generateRefreshToken();

        // Create session
        const sessionId = await authMiddleware.createSession(user.id, token, refreshToken);

        // Update last login
        await database.run(
            'UPDATE users SET last_login = datetime("now") WHERE id = ?',
            [user.id]
        );

        // Log successful login
        logger.userActivity(user.id, 'user_login', {
            session_id: sessionId,
            ip_address: clientIP
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin,
                preferences: user.preferences ? JSON.parse(user.preferences) : {}
            },
            session: {
                token,
                refreshToken,
                expiresIn: config.security.jwtExpiresIn
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'login' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authenticate user'
        });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Refresh token is required',
                code: 'MISSING_REFRESH_TOKEN'
            });
        }

        // Find session with refresh token
        const session = await database.get(
            'SELECT s.*, u.id as user_id, u.username, u.is_active FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.refresh_token = ? AND s.is_active = 1 AND s.expires_at > datetime("now")',
            [refreshToken]
        );

        if (!session || !session.is_active) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid or expired refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Generate new tokens
        const newToken = authMiddleware.generateToken(session.user_id);
        const newRefreshToken = authMiddleware.generateRefreshToken();

        // Update session
        await database.run(
            'UPDATE sessions SET session_token = ?, refresh_token = ?, expires_at = datetime("now", "+7 days") WHERE id = ?',
            [newToken, newRefreshToken, session.id]
        );

        res.json({
            message: 'Token refreshed successfully',
            session: {
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: config.security.jwtExpiresIn
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'refresh' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to refresh token'
        });
    }
});

// Logout
router.post('/logout', authMiddleware.requireAuth, async (req, res) => {
    try {
        // Invalidate current session
        if (req.session) {
            await authMiddleware.invalidateSession(req.session.id);
        }

        // Log logout
        logger.userActivity(req.user.id, 'user_logout', {
            session_id: req.session?.id
        });

        res.json({
            message: 'Logout successful'
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'logout' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to logout'
        });
    }
});

// Logout from all devices
router.post('/logout-all', authMiddleware.requireAuth, async (req, res) => {
    try {
        // Invalidate all user sessions
        await authMiddleware.invalidateAllUserSessions(req.user.id);

        // Log logout all
        logger.userActivity(req.user.id, 'user_logout_all');

        res.json({
            message: 'Logged out from all devices successfully'
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'logoutAll' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to logout from all devices'
        });
    }
});

// Get current user profile
router.get('/profile', authMiddleware.requireAuth, async (req, res) => {
    try {
        const user = await database.get(
            'SELECT id, username, email, first_name, last_name, avatar_url, preferences, created_at, last_login, is_admin FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: user.avatar_url,
                preferences: user.preferences ? JSON.parse(user.preferences) : {},
                createdAt: user.created_at,
                lastLogin: user.last_login,
                isAdmin: user.is_admin
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'getProfile' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch user profile'
        });
    }
});

// Update user profile
router.patch('/profile', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { firstName, lastName, email, avatarUrl } = req.body;

        // Validate email if provided
        if (email && !authMiddleware.validateEmail(email)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid email format',
                code: 'INVALID_EMAIL'
            });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingEmail = await database.get(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, req.user.id]
            );

            if (existingEmail) {
                return res.status(409).json({
                    error: 'Conflict',
                    message: 'Email already exists',
                    code: 'EMAIL_EXISTS'
                });
            }
        }

        // Build update query
        const updates = [];
        const params = [];

        if (firstName !== undefined) {
            updates.push('first_name = ?');
            params.push(firstName);
        }

        if (lastName !== undefined) {
            updates.push('last_name = ?');
            params.push(lastName);
        }

        if (email !== undefined) {
            updates.push('email = ?');
            params.push(email);
        }

        if (avatarUrl !== undefined) {
            updates.push('avatar_url = ?');
            params.push(avatarUrl);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No fields to update',
                code: 'NO_UPDATES'
            });
        }

        updates.push('updated_at = datetime("now")');
        params.push(req.user.id);

        const result = await database.run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Log profile update
        logger.userActivity(req.user.id, 'profile_updated', {
            updated_fields: Object.keys(req.body)
        });

        res.json({
            message: 'Profile updated successfully'
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'updateProfile' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update profile'
        });
    }
});

// Change password
router.patch('/change-password', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Current password and new password are required',
                code: 'MISSING_PASSWORDS'
            });
        }

        // Validate new password strength
        const passwordValidation = authMiddleware.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'New password does not meet requirements',
                code: 'WEAK_PASSWORD',
                details: passwordValidation.errors
            });
        }

        // Get current user with password hash
        const user = await database.get(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user.id]
        );

        // Verify current password
        const isValidCurrentPassword = await authMiddleware.comparePassword(currentPassword, user.password_hash);

        if (!isValidCurrentPassword) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }

        // Hash new password
        const hashedNewPassword = await authMiddleware.hashPassword(newPassword);

        // Update password
        await database.run(
            'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
            [hashedNewPassword, req.user.id]
        );

        // Invalidate all sessions (force re-login)
        await authMiddleware.invalidateAllUserSessions(req.user.id);

        // Log password change
        logger.userActivity(req.user.id, 'password_changed');

        res.json({
            message: 'Password changed successfully. Please log in again.'
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'changePassword' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to change password'
        });
    }
});

// Get active sessions
router.get('/sessions', authMiddleware.requireAuth, async (req, res) => {
    try {
        const sessions = await database.all(
            `SELECT 
                id,
                session_token,
                created_at,
                last_activity,
                expires_at,
                ip_address,
                user_agent
             FROM sessions
             WHERE user_id = ? AND is_active = 1 AND expires_at > datetime("now")
             ORDER BY last_activity DESC`,
            [req.user.id]
        );

        res.json({
            sessions: sessions.map(session => ({
                id: session.id,
                createdAt: session.created_at,
                lastActivity: session.last_activity,
                expiresAt: session.expires_at,
                ipAddress: session.ip_address,
                userAgent: session.user_agent,
                isCurrent: session.session_token === req.session?.token
            }))
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'getSessions' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch sessions'
        });
    }
});

// Revoke specific session
router.delete('/sessions/:sessionId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await database.run(
            'UPDATE sessions SET is_active = 0 WHERE id = ? AND user_id = ?',
            [sessionId, req.user.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Session not found',
                code: 'SESSION_NOT_FOUND'
            });
        }

        // Log session revocation
        logger.userActivity(req.user.id, 'session_revoked', {
            session_id: sessionId
        });

        res.json({
            message: 'Session revoked successfully'
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'revokeSession' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to revoke session'
        });
    }
});

// Validate current session
router.get('/validate', authMiddleware.requireAuth, async (req, res) => {
    try {
        res.json({
            valid: true,
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                isAdmin: req.user.isAdmin
            },
            session: {
                expiresAt: req.session.expiresAt
            }
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Session Routes', operation: 'validateSession' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to validate session'
        });
    }
});

module.exports = router;

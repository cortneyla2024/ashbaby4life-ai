const { database } = require('./models/database');
const logger = require('./utils/logger');
const config = require('./config/config');

class SessionTracker {
    constructor() {
        this.activeSessions = new Map();
        this.sessionTimeout = config.session.timeout || 30 * 60 * 1000; // 30 minutes default
        this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
        this.isRunning = false;
    }

    /**
     * Initialize the session tracker
     */
    async initialize() {
        try {
            logger.info('Initializing Session Tracker...');
            
            // Load active sessions from database
            await this.loadActiveSessions();
            
            // Start cleanup interval
            this.startCleanupInterval();
            
            this.isRunning = true;
            logger.info('Session Tracker initialized successfully');
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'initialize' });
        }
    }

    /**
     * Load active sessions from database
     */
    async loadActiveSessions() {
        try {
            const activeSessions = await database.all(
                `SELECT * FROM sessions 
                 WHERE expires_at > datetime('now') 
                 AND status = 'active'`
            );

            activeSessions.forEach(session => {
                this.activeSessions.set(session.session_id, {
                    ...session,
                    last_activity: new Date(session.last_activity),
                    created_at: new Date(session.created_at),
                    expires_at: new Date(session.expires_at)
                });
            });

            logger.info(`Loaded ${activeSessions.length} active sessions`);
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'loadActiveSessions' });
        }
    }

    /**
     * Create a new session
     */
    async createSession(userId, sessionData = {}) {
        try {
            const sessionId = this.generateSessionId();
            const now = new Date();
            const expiresAt = new Date(now.getTime() + this.sessionTimeout);

            const session = {
                session_id: sessionId,
                user_id: userId,
                ip_address: sessionData.ip_address || '',
                user_agent: sessionData.user_agent || '',
                device_info: sessionData.device_info || '',
                location: sessionData.location || '',
                status: 'active',
                created_at: now,
                last_activity: now,
                expires_at: expiresAt,
                metadata: JSON.stringify(sessionData.metadata || {})
            };

            // Save to database
            await database.run(
                `INSERT INTO sessions (
                    session_id, user_id, ip_address, user_agent, device_info, location,
                    status, created_at, last_activity, expires_at, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    session.session_id, session.user_id, session.ip_address, session.user_agent,
                    session.device_info, session.location, session.status, session.created_at.toISOString(),
                    session.last_activity.toISOString(), session.expires_at.toISOString(), session.metadata
                ]
            );

            // Add to active sessions
            this.activeSessions.set(sessionId, session);

            // Log session creation
            logger.userActivity(userId, 'session_created', {
                session_id: sessionId,
                ip_address: session.ip_address,
                user_agent: session.user_agent
            });

            return session;
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'createSession' });
            throw error;
        }
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId) {
        try {
            // Check active sessions first
            if (this.activeSessions.has(sessionId)) {
                const session = this.activeSessions.get(sessionId);
                
                // Check if session is expired
                if (session.expires_at < new Date()) {
                    await this.invalidateSession(sessionId);
                    return null;
                }
                
                return session;
            }

            // Check database
            const session = await database.get(
                'SELECT * FROM sessions WHERE session_id = ? AND status = "active"',
                [sessionId]
            );

            if (session) {
                // Check if session is expired
                if (new Date(session.expires_at) < new Date()) {
                    await this.invalidateSession(sessionId);
                    return null;
                }

                // Add to active sessions
                this.activeSessions.set(sessionId, {
                    ...session,
                    last_activity: new Date(session.last_activity),
                    created_at: new Date(session.created_at),
                    expires_at: new Date(session.expires_at)
                });

                return session;
            }

            return null;
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'getSession' });
            return null;
        }
    }

    /**
     * Update session activity
     */
    async updateSessionActivity(sessionId, activityData = {}) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                return false;
            }

            const now = new Date();
            const newExpiresAt = new Date(now.getTime() + this.sessionTimeout);

            // Update in memory
            if (this.activeSessions.has(sessionId)) {
                const activeSession = this.activeSessions.get(sessionId);
                activeSession.last_activity = now;
                activeSession.expires_at = newExpiresAt;
            }

            // Update in database
            await database.run(
                `UPDATE sessions 
                 SET last_activity = ?, expires_at = ?, metadata = ?
                 WHERE session_id = ?`,
                [
                    now.toISOString(),
                    newExpiresAt.toISOString(),
                    JSON.stringify({ ...JSON.parse(session.metadata || '{}'), ...activityData }),
                    sessionId
                ]
            );

            return true;
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'updateSessionActivity' });
            return false;
        }
    }

    /**
     * Invalidate a session
     */
    async invalidateSession(sessionId) {
        try {
            // Remove from active sessions
            this.activeSessions.delete(sessionId);

            // Update database
            await database.run(
                'UPDATE sessions SET status = "inactive", updated_at = datetime("now") WHERE session_id = ?',
                [sessionId]
            );

            logger.info(`Session invalidated: ${sessionId}`);
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'invalidateSession' });
        }
    }

    /**
     * Invalidate all sessions for a user
     */
    async invalidateUserSessions(userId, exceptSessionId = null) {
        try {
            // Remove from active sessions
            for (const [sessionId, session] of this.activeSessions.entries()) {
                if (session.user_id === userId && sessionId !== exceptSessionId) {
                    this.activeSessions.delete(sessionId);
                }
            }

            // Update database
            let query = 'UPDATE sessions SET status = "inactive", updated_at = datetime("now") WHERE user_id = ?';
            const params = [userId];

            if (exceptSessionId) {
                query += ' AND session_id != ?';
                params.push(exceptSessionId);
            }

            await database.run(query, params);

            logger.info(`All sessions invalidated for user: ${userId}`);
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'invalidateUserSessions' });
        }
    }

    /**
     * Get user sessions
     */
    async getUserSessions(userId, limit = 10) {
        try {
            const sessions = await database.all(
                `SELECT * FROM sessions 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ?`,
                [userId, limit]
            );

            return sessions;
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'getUserSessions' });
            return [];
        }
    }

    /**
     * Get active sessions count
     */
    getActiveSessionsCount() {
        return this.activeSessions.size;
    }

    /**
     * Get session statistics
     */
    async getSessionStats(period = '24h') {
        try {
            let timeFilter = '';
            switch (period) {
                case '1h':
                    timeFilter = 'AND created_at > datetime("now", "-1 hour")';
                    break;
                case '24h':
                    timeFilter = 'AND created_at > datetime("now", "-1 day")';
                    break;
                case '7d':
                    timeFilter = 'AND created_at > datetime("now", "-7 days")';
                    break;
                case '30d':
                    timeFilter = 'AND created_at > datetime("now", "-30 days")';
                    break;
                default:
                    timeFilter = 'AND created_at > datetime("now", "-1 day")';
            }

            // Get total sessions created
            const totalSessions = await database.get(
                `SELECT COUNT(*) as count FROM sessions WHERE 1=1 ${timeFilter}`,
                []
            );

            // Get active sessions
            const activeSessions = await database.get(
                `SELECT COUNT(*) as count FROM sessions WHERE status = "active" ${timeFilter}`,
                []
            );

            // Get sessions by user
            const sessionsByUser = await database.all(
                `SELECT user_id, COUNT(*) as session_count 
                 FROM sessions 
                 WHERE 1=1 ${timeFilter}
                 GROUP BY user_id 
                 ORDER BY session_count DESC 
                 LIMIT 10`,
                []
            );

            // Get average session duration
            const avgDuration = await database.get(
                `SELECT AVG(
                    CAST((julianday(updated_at) - julianday(created_at)) * 24 * 60 AS INTEGER)
                ) as avg_duration_minutes 
                 FROM sessions 
                 WHERE status = "inactive" ${timeFilter}`,
                []
            );

            return {
                period,
                total_sessions: totalSessions.count,
                active_sessions: activeSessions.count,
                sessions_by_user: sessionsByUser,
                avg_duration_minutes: avgDuration.avg_duration_minutes || 0,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'getSessionStats' });
            return {
                period,
                total_sessions: 0,
                active_sessions: 0,
                sessions_by_user: [],
                avg_duration_minutes: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        this.cleanupIntervalId = setInterval(async () => {
            await this.cleanupExpiredSessions();
        }, this.cleanupInterval);
    }

    /**
     * Cleanup expired sessions
     */
    async cleanupExpiredSessions() {
        try {
            const now = new Date();
            const expiredSessions = [];

            // Check active sessions in memory
            for (const [sessionId, session] of this.activeSessions.entries()) {
                if (session.expires_at < now) {
                    expiredSessions.push(sessionId);
                }
            }

            // Invalidate expired sessions
            for (const sessionId of expiredSessions) {
                await this.invalidateSession(sessionId);
            }

            // Clean up database
            await database.run(
                `UPDATE sessions 
                 SET status = "inactive", updated_at = datetime("now") 
                 WHERE expires_at < datetime("now") AND status = "active"`
            );

            if (expiredSessions.length > 0) {
                logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
            }
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'cleanupExpiredSessions' });
        }
    }

    /**
     * Generate a unique session ID
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${randomPart}`;
    }

    /**
     * Track session event
     */
    async trackSessionEvent(sessionId, eventType, eventData = {}) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                return false;
            }

            // Update session activity
            await this.updateSessionActivity(sessionId, {
                last_event: eventType,
                last_event_time: new Date().toISOString()
            });

            // Log event
            logger.userActivity(session.user_id, `session_${eventType}`, {
                session_id: sessionId,
                event_data: eventData
            });

            return true;
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'trackSessionEvent' });
            return false;
        }
    }

    /**
     * Get session analytics
     */
    async getSessionAnalytics(userId = null, period = '24h') {
        try {
            let userFilter = '';
            const params = [];

            if (userId) {
                userFilter = 'AND user_id = ?';
                params.push(userId);
            }

            let timeFilter = '';
            switch (period) {
                case '1h':
                    timeFilter = 'AND created_at > datetime("now", "-1 hour")';
                    break;
                case '24h':
                    timeFilter = 'AND created_at > datetime("now", "-1 day")';
                    break;
                case '7d':
                    timeFilter = 'AND created_at > datetime("now", "-7 days")';
                    break;
                case '30d':
                    timeFilter = 'AND created_at > datetime("now", "-30 days")';
                    break;
                default:
                    timeFilter = 'AND created_at > datetime("now", "-1 day")';
            }

            // Get sessions by hour
            const sessionsByHour = await database.all(
                `SELECT 
                    strftime('%H', created_at) as hour,
                    COUNT(*) as count
                 FROM sessions 
                 WHERE 1=1 ${timeFilter} ${userFilter}
                 GROUP BY hour 
                 ORDER BY hour`,
                params
            );

            // Get sessions by day
            const sessionsByDay = await database.all(
                `SELECT 
                    date(created_at) as day,
                    COUNT(*) as count
                 FROM sessions 
                 WHERE 1=1 ${timeFilter} ${userFilter}
                 GROUP BY day 
                 ORDER BY day`,
                params
            );

            // Get device statistics
            const deviceStats = await database.all(
                `SELECT 
                    device_info,
                    COUNT(*) as count
                 FROM sessions 
                 WHERE device_info IS NOT NULL AND device_info != '' ${timeFilter} ${userFilter}
                 GROUP BY device_info 
                 ORDER BY count DESC 
                 LIMIT 10`,
                params
            );

            // Get location statistics
            const locationStats = await database.all(
                `SELECT 
                    location,
                    COUNT(*) as count
                 FROM sessions 
                 WHERE location IS NOT NULL AND location != '' ${timeFilter} ${userFilter}
                 GROUP BY location 
                 ORDER BY count DESC 
                 LIMIT 10`,
                params
            );

            return {
                period,
                user_id: userId,
                sessions_by_hour: sessionsByHour,
                sessions_by_day: sessionsByDay,
                device_stats: deviceStats,
                location_stats: locationStats,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'getSessionAnalytics' });
            return {
                period,
                user_id: userId,
                sessions_by_hour: [],
                sessions_by_day: [],
                device_stats: [],
                location_stats: [],
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get tracker status
     */
    getStatus() {
        return {
            is_running: this.isRunning,
            active_sessions: this.activeSessions.size,
            session_timeout: this.sessionTimeout,
            cleanup_interval: this.cleanupInterval,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Shutdown the session tracker
     */
    async shutdown() {
        try {
            logger.info('Shutting down Session Tracker...');
            
            this.isRunning = false;
            
            if (this.cleanupIntervalId) {
                clearInterval(this.cleanupIntervalId);
            }
            
            // Clean up expired sessions before shutdown
            await this.cleanupExpiredSessions();
            
            logger.info('Session Tracker shutdown complete');
            
        } catch (error) {
            logger.errorWithContext(error, { component: 'Session Tracker', operation: 'shutdown' });
        }
    }
}

// Create singleton instance
const sessionTracker = new SessionTracker();

module.exports = sessionTracker;

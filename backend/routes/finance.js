const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { database } = require('../models/database');
const logger = require('../utils/logger');
const config = require('../config/config');

// Get financial overview
router.get('/overview', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let timeFilter = '';
        switch (period) {
            case '7d':
                timeFilter = 'AND date >= date("now", "-7 days")';
                break;
            case '30d':
                timeFilter = 'AND date >= date("now", "-30 days")';
                break;
            case '90d':
                timeFilter = 'AND date >= date("now", "-90 days")';
                break;
            default:
                timeFilter = 'AND date >= date("now", "-30 days")';
        }

        // Get total balance across all accounts
        const totalBalance = await database.get(
            'SELECT SUM(balance) as total_balance FROM financial_accounts WHERE user_id = ?',
            [req.user.id]
        );

        // Get income and expenses for the period
        const incomeExpenses = await database.get(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
             FROM financial_transactions 
             WHERE user_id = ? ${timeFilter}`,
            [req.user.id]
        );

        // Get account balances
        const accounts = await database.all(
            'SELECT * FROM financial_accounts WHERE user_id = ? ORDER BY balance DESC',
            [req.user.id]
        );

        // Get recent transactions
        const recentTransactions = await database.all(
            `SELECT * FROM financial_transactions 
             WHERE user_id = ? ${timeFilter}
             ORDER BY date DESC, created_at DESC 
             LIMIT 10`,
            [req.user.id]
        );

        // Get financial goals progress
        const goals = await database.all(
            'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY target_date ASC',
            [req.user.id]
        );

        const overview = {
            total_balance: totalBalance.total_balance || 0,
            total_income: incomeExpenses.total_income || 0,
            total_expenses: incomeExpenses.total_expenses || 0,
            net_income: (incomeExpenses.total_income || 0) - (incomeExpenses.total_expenses || 0),
            accounts,
            recent_transactions: recentTransactions,
            goals,
            period,
            timestamp: new Date().toISOString()
        };

        res.json(overview);

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'getOverview' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch financial overview'
        });
    }
});

// Get all financial accounts
router.get('/accounts', authMiddleware.requireAuth, async (req, res) => {
    try {
        const accounts = await database.all(
            'SELECT * FROM financial_accounts WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({
            accounts,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'getAccounts' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch financial accounts'
        });
    }
});

// Get a specific financial account
router.get('/accounts/:accountId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { accountId } = req.params;

        const account = await database.get(
            'SELECT * FROM financial_accounts WHERE id = ? AND user_id = ?',
            [accountId, req.user.id]
        );

        if (!account) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Financial account not found',
                code: 'ACCOUNT_NOT_FOUND'
            });
        }

        // Get account transactions
        const transactions = await database.all(
            'SELECT * FROM financial_transactions WHERE account_id = ? AND user_id = ? ORDER BY date DESC, created_at DESC',
            [accountId, req.user.id]
        );

        res.json({
            account,
            transactions,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'getAccount' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch financial account'
        });
    }
});

// Create a new financial account
router.post('/accounts', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { name, type, balance, currency, description } = req.body;

        // Validate required fields
        if (!name || !type) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Name and type are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate account type
        const validTypes = ['checking', 'savings', 'credit', 'investment', 'cash', 'other'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid account type',
                code: 'INVALID_ACCOUNT_TYPE',
                valid_types: validTypes
            });
        }

        const result = await database.run(
            `INSERT INTO financial_accounts (
                user_id, name, type, balance, currency, description, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                req.user.id, name, type, balance || 0, currency || 'USD', description || ''
            ]
        );

        const newAccount = await database.get(
            'SELECT * FROM financial_accounts WHERE id = ?',
            [result.lastID]
        );

        // Log account creation
        logger.userActivity(req.user.id, 'financial_account_created', {
            account_id: result.lastID,
            account_type: type,
            account_name: name
        });

        res.status(201).json({
            account: newAccount,
            message: 'Financial account created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'createAccount' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create financial account'
        });
    }
});

// Update a financial account
router.put('/accounts/:accountId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { accountId } = req.params;
        const { name, type, balance, currency, description } = req.body;

        // Check if account exists and belongs to user
        const existingAccount = await database.get(
            'SELECT * FROM financial_accounts WHERE id = ? AND user_id = ?',
            [accountId, req.user.id]
        );

        if (!existingAccount) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Financial account not found',
                code: 'ACCOUNT_NOT_FOUND'
            });
        }

        // Validate account type if provided
        if (type) {
            const validTypes = ['checking', 'savings', 'credit', 'investment', 'cash', 'other'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid account type',
                    code: 'INVALID_ACCOUNT_TYPE'
                });
            }
        }

        const updateFields = [];
        const params = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            params.push(name);
        }

        if (type !== undefined) {
            updateFields.push('type = ?');
            params.push(type);
        }

        if (balance !== undefined) {
            updateFields.push('balance = ?');
            params.push(balance);
        }

        if (currency !== undefined) {
            updateFields.push('currency = ?');
            params.push(currency);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }

        updateFields.push('updated_at = datetime("now")');
        params.push(accountId, req.user.id);

        const query = `UPDATE financial_accounts SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
        await database.run(query, params);

        const updatedAccount = await database.get(
            'SELECT * FROM financial_accounts WHERE id = ?',
            [accountId]
        );

        // Log account update
        logger.userActivity(req.user.id, 'financial_account_updated', {
            account_id: accountId,
            updated_fields: Object.keys(req.body)
        });

        res.json({
            account: updatedAccount,
            message: 'Financial account updated successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'updateAccount' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update financial account'
        });
    }
});

// Delete a financial account
router.delete('/accounts/:accountId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { accountId } = req.params;

        // Check if account exists and belongs to user
        const account = await database.get(
            'SELECT * FROM financial_accounts WHERE id = ? AND user_id = ?',
            [accountId, req.user.id]
        );

        if (!account) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Financial account not found',
                code: 'ACCOUNT_NOT_FOUND'
            });
        }

        // Delete account transactions first
        await database.run(
            'DELETE FROM financial_transactions WHERE account_id = ? AND user_id = ?',
            [accountId, req.user.id]
        );

        // Delete the account
        await database.run(
            'DELETE FROM financial_accounts WHERE id = ? AND user_id = ?',
            [accountId, req.user.id]
        );

        // Log account deletion
        logger.userActivity(req.user.id, 'financial_account_deleted', {
            account_id: accountId,
            account_name: account.name
        });

        res.json({
            message: 'Financial account deleted successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'deleteAccount' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete financial account'
        });
    }
});

// Get all transactions
router.get('/transactions', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { accountId, type, category, startDate, endDate, limit = 50, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM financial_transactions WHERE user_id = ?';
        const params = [req.user.id];

        if (accountId) {
            query += ' AND account_id = ?';
            params.push(accountId);
        }

        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (startDate) {
            query += ' AND date >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND date <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const transactions = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM financial_transactions WHERE user_id = ?';
        const countParams = [req.user.id];

        if (accountId) {
            countQuery += ' AND account_id = ?';
            countParams.push(accountId);
        }

        if (type) {
            countQuery += ' AND type = ?';
            countParams.push(type);
        }

        if (category) {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        if (startDate) {
            countQuery += ' AND date >= ?';
            countParams.push(startDate);
        }

        if (endDate) {
            countQuery += ' AND date <= ?';
            countParams.push(endDate);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'getTransactions' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch transactions'
        });
    }
});

// Create a new transaction
router.post('/transactions', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { accountId, type, amount, category, description, date } = req.body;

        // Validate required fields
        if (!accountId || !type || !amount) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Account ID, type, and amount are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate transaction type
        const validTypes = ['income', 'expense', 'transfer'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid transaction type',
                code: 'INVALID_TRANSACTION_TYPE',
                valid_types: validTypes
            });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Amount must be greater than 0',
                code: 'INVALID_AMOUNT'
            });
        }

        // Check if account exists and belongs to user
        const account = await database.get(
            'SELECT * FROM financial_accounts WHERE id = ? AND user_id = ?',
            [accountId, req.user.id]
        );

        if (!account) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Financial account not found',
                code: 'ACCOUNT_NOT_FOUND'
            });
        }

        const result = await database.run(
            `INSERT INTO financial_transactions (
                user_id, account_id, type, amount, category, description, date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [
                req.user.id, accountId, type, amount, category || '', 
                description || '', date || new Date().toISOString().split('T')[0]
            ]
        );

        // Update account balance
        const balanceChange = type === 'income' ? amount : -amount;
        await database.run(
            'UPDATE financial_accounts SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?',
            [balanceChange, accountId]
        );

        const newTransaction = await database.get(
            'SELECT * FROM financial_transactions WHERE id = ?',
            [result.lastID]
        );

        // Log transaction creation
        logger.userActivity(req.user.id, 'financial_transaction_created', {
            transaction_id: result.lastID,
            account_id: accountId,
            type,
            amount,
            category
        });

        res.status(201).json({
            transaction: newTransaction,
            message: 'Transaction created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'createTransaction' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create transaction'
        });
    }
});

// Get financial goals
router.get('/goals', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM financial_goals WHERE user_id = ?';
        const params = [req.user.id];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY target_date ASC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const goals = await database.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as count FROM financial_goals WHERE user_id = ?';
        const countParams = [req.user.id];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        const totalCount = await database.get(countQuery, countParams);

        res.json({
            goals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.count,
                pages: Math.ceil(totalCount.count / limit)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'getGoals' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch financial goals'
        });
    }
});

// Create a new financial goal
router.post('/goals', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { name, target_amount, current_amount, target_date, description, category } = req.body;

        // Validate required fields
        if (!name || !target_amount || !target_date) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Name, target amount, and target date are required',
                code: 'MISSING_REQUIRED_FIELDS'
            });
        }

        // Validate target amount
        if (target_amount <= 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Target amount must be greater than 0',
                code: 'INVALID_TARGET_AMOUNT'
            });
        }

        // Validate current amount
        if (current_amount && current_amount < 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Current amount cannot be negative',
                code: 'INVALID_CURRENT_AMOUNT'
            });
        }

        const result = await database.run(
            `INSERT INTO financial_goals (
                user_id, name, target_amount, current_amount, target_date, description, category, 
                status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                req.user.id, name, target_amount, current_amount || 0, target_date,
                description || '', category || '', 'active'
            ]
        );

        const newGoal = await database.get(
            'SELECT * FROM financial_goals WHERE id = ?',
            [result.lastID]
        );

        // Log goal creation
        logger.userActivity(req.user.id, 'financial_goal_created', {
            goal_id: result.lastID,
            target_amount,
            category
        });

        res.status(201).json({
            goal: newGoal,
            message: 'Financial goal created successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'createGoal' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create financial goal'
        });
    }
});

// Update a financial goal
router.put('/goals/:goalId', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { goalId } = req.params;
        const { name, target_amount, current_amount, target_date, description, category, status } = req.body;

        // Check if goal exists and belongs to user
        const existingGoal = await database.get(
            'SELECT * FROM financial_goals WHERE id = ? AND user_id = ?',
            [goalId, req.user.id]
        );

        if (!existingGoal) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Financial goal not found',
                code: 'GOAL_NOT_FOUND'
            });
        }

        // Validate status if provided
        if (status) {
            const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
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

        if (target_amount !== undefined) {
            updateFields.push('target_amount = ?');
            params.push(target_amount);
        }

        if (current_amount !== undefined) {
            updateFields.push('current_amount = ?');
            params.push(current_amount);
        }

        if (target_date !== undefined) {
            updateFields.push('target_date = ?');
            params.push(target_date);
        }

        if (description !== undefined) {
            updateFields.push('description = ?');
            params.push(description);
        }

        if (category !== undefined) {
            updateFields.push('category = ?');
            params.push(category);
        }

        if (status !== undefined) {
            updateFields.push('status = ?');
            params.push(status);
        }

        updateFields.push('updated_at = datetime("now")');
        params.push(goalId, req.user.id);

        const query = `UPDATE financial_goals SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`;
        await database.run(query, params);

        const updatedGoal = await database.get(
            'SELECT * FROM financial_goals WHERE id = ?',
            [goalId]
        );

        // Log goal update
        logger.userActivity(req.user.id, 'financial_goal_updated', {
            goal_id: goalId,
            updated_fields: Object.keys(req.body)
        });

        res.json({
            goal: updatedGoal,
            message: 'Financial goal updated successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'updateGoal' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update financial goal'
        });
    }
});

// Get financial statistics
router.get('/stats', authMiddleware.requireAuth, async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let timeFilter = '';
        switch (period) {
            case '7d':
                timeFilter = 'AND date >= date("now", "-7 days")';
                break;
            case '30d':
                timeFilter = 'AND date >= date("now", "-30 days")';
                break;
            case '90d':
                timeFilter = 'AND date >= date("now", "-90 days")';
                break;
            default:
                timeFilter = 'AND date >= date("now", "-30 days")';
        }

        // Get income vs expenses
        const incomeExpenses = await database.get(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
             FROM financial_transactions 
             WHERE user_id = ? ${timeFilter}`,
            [req.user.id]
        );

        // Get spending by category
        const spendingByCategory = await database.all(
            `SELECT category, SUM(amount) as total_amount, COUNT(*) as transaction_count
             FROM financial_transactions 
             WHERE user_id = ? AND type = 'expense' ${timeFilter}
             GROUP BY category 
             ORDER BY total_amount DESC`,
            [req.user.id]
        );

        // Get account balances
        const accountBalances = await database.all(
            'SELECT name, type, balance FROM financial_accounts WHERE user_id = ? ORDER BY balance DESC',
            [req.user.id]
        );

        // Get goal progress
        const goalProgress = await database.all(
            'SELECT name, target_amount, current_amount, (current_amount * 100.0 / target_amount) as progress FROM financial_goals WHERE user_id = ? AND status = "active"',
            [req.user.id]
        );

        res.json({
            period,
            income_expenses: incomeExpenses,
            spending_by_category: spendingByCategory,
            account_balances: accountBalances,
            goal_progress: goalProgress,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.errorWithContext(error, { component: 'Finance Routes', operation: 'getStats' });
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch financial statistics'
        });
    }
});

module.exports = router;

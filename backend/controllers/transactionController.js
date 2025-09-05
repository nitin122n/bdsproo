const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Create deposit request
const createDeposit = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const userId = req.user.user_id;
        const { amount, method, note } = req.body;

        // Validate minimum deposit amount
        if (amount < 50) {
            return res.status(400).json({
                success: false,
                message: 'Minimum deposit amount is 50 USDT'
            });
        }

        // Create deposit transaction
        const [result] = await pool.execute(
            `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status) 
             VALUES (?, 'deposit', ?, ?, 0, ?, ?)`,
            [
                userId,
                amount,
                amount,
                amount,
                `Deposit via ${method}${note ? ` - ${note}` : ''}`
            ]
        );

        // Update user balance
        await pool.execute(
            'UPDATE users SET account_balance = account_balance + ? WHERE user_id = ?',
            [amount, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Deposit request created successfully',
            data: {
                transaction_id: result.insertId,
                amount,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Create deposit error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Create withdrawal request
const createWithdrawal = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const userId = req.user.user_id;
        const { amount, address, note } = req.body;

        // Validate minimum withdrawal amount
        if (amount < 10) {
            return res.status(400).json({
                success: false,
                message: 'Minimum withdrawal amount is 10 USDT'
            });
        }

        // Check user balance
        const [users] = await pool.execute(
            'SELECT account_balance FROM users WHERE user_id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentBalance = users[0].account_balance;

        if (amount > currentBalance) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance for withdrawal'
            });
        }

        // Validate USDT address
        if (!address || address.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid USDT address'
            });
        }

        // Create withdrawal transaction
        const [result] = await pool.execute(
            `INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status) 
             VALUES (?, 'withdrawal', ?, 0, ?, ?, ?)`,
            [
                userId,
                amount,
                amount,
                currentBalance - amount,
                `Withdrawal to ${address.substring(0, 10)}...${note ? ` - ${note}` : ''}`
            ]
        );

        // Update user balance
        await pool.execute(
            'UPDATE users SET account_balance = account_balance - ? WHERE user_id = ?',
            [amount, userId]
        );

        res.status(201).json({
            success: true,
            message: 'Withdrawal request created successfully',
            data: {
                transaction_id: result.insertId,
                amount,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Create withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get transaction history with filters
const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { 
            type = 'all', 
            status = 'all', 
            page = 1, 
            limit = 20,
            startDate,
            endDate
        } = req.query;

        let whereConditions = ['user_id = ?'];
        let params = [userId];

        // Type filter
        if (type !== 'all') {
            whereConditions.push('type = ?');
            params.push(type);
        }

        // Status filter
        if (status !== 'all') {
            whereConditions.push('status = ?');
            params.push(status);
        }

        // Date range filter
        if (startDate && endDate) {
            whereConditions.push('DATE(timestamp) BETWEEN ? AND ?');
            params.push(startDate, endDate);
        }

        const whereClause = whereConditions.join(' AND ');

        // Get total count
        const [countResult] = await pool.execute(
            `SELECT COUNT(*) as total FROM transactions WHERE ${whereClause}`,
            params
        );

        const total = countResult[0].total;
        const offset = (page - 1) * limit;

        // Get transactions
        const [transactions] = await pool.execute(
            `SELECT 
                id, type, amount, credit, debit, balance, description, status, timestamp
             FROM transactions 
             WHERE ${whereClause}
             ORDER BY timestamp DESC 
             LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        // Format transactions
        const formattedTransactions = transactions.map(t => ({
            ...t,
            timestamp: new Date(t.timestamp).toISOString(),
            date: new Date(t.timestamp).toLocaleDateString(),
            type_label: getTypeLabel(t.type)
        }));

        res.json({
            success: true,
            data: {
                transactions: formattedTransactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Helper function to get type labels
const getTypeLabel = (type) => {
    const labels = {
        'deposit': 'Deposit',
        'withdrawal': 'Withdrawal',
        'cashback': 'My Cashback',
        'level1_income': 'Level 1 Income',
        'level2_income': 'Level 2 Income',
        'reward': 'Reward'
    };
    return labels[type] || type;
};

module.exports = {
    createDeposit,
    createWithdrawal,
    getTransactionHistory
};

// New: get transactions by dashboard card category (and ensure table exists)
const ensureDashboardTable = async () => {
    await pool.execute(`
        CREATE TABLE IF NOT EXISTS dashboard_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            category VARCHAR(255) NOT NULL,
            date DATETIME NOT NULL,
            withdrawal_amount DECIMAL(18,2) NOT NULL,
            transaction_id VARCHAR(255) NOT NULL,
            withdrawal_from VARCHAR(255) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
};

const getTransactionsByCategory = async (req, res) => {
    try {
        const { category, withdrawal_from, start, end } = req.query;

        if (!category) {
            return res.status(400).json({ success: false, message: 'category is required' });
        }

        // Skip Rewards per requirement
        if (String(category).toLowerCase() === 'rewards') {
            return res.status(400).json({ success: false, message: 'Rewards is excluded from this operation' });
        }

        await ensureDashboardTable();

        // Optional seeding: if table has no rows for this category, insert a few demo rows
        const [countRows] = await pool.execute(
            'SELECT COUNT(*) AS cnt FROM dashboard_transactions WHERE category = ?',
            [category]
        );
        const existingCount = countRows[0]?.cnt || 0;
        if (existingCount === 0) {
            const seed = [
                [category, new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), 39.93, `TX${Date.now() - 1000}`, 'Cashback'],
                [category, new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), 27.59, `TX${Date.now() - 2000}`, 'Cashback'],
                [category, new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), 61.25, `TX${Date.now() - 3000}`, 'Level 1'],
                [category, new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), 43.55, `TX${Date.now() - 4000}`, 'Level 2']
            ];
            for (const [cat, d, amt, tx, from] of seed) {
                await pool.execute(
                    `INSERT INTO dashboard_transactions (category, date, withdrawal_amount, transaction_id, withdrawal_from)
                     VALUES (?, ?, ?, ?, ?)`,
                    [cat, formatDateTime(d), amt, tx, from]
                );
            }
        }

        // Build filters
        const where = ['category = ?'];
        const params = [category];
        if (withdrawal_from) {
            where.push('withdrawal_from = ?');
            params.push(withdrawal_from);
        }
        if (start && end) {
            where.push('DATE(date) BETWEEN ? AND ?');
            params.push(start, end);
        }

        const [rows] = await pool.execute(
            `SELECT date, withdrawal_amount, transaction_id, withdrawal_from
             FROM dashboard_transactions
             WHERE ${where.join(' AND ')}
             ORDER BY date DESC`,
            params
        );

        return res.json({ success: true, data: rows });
    } catch (error) {
        console.error('getTransactionsByCategory error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports.getTransactionsByCategory = getTransactionsByCategory;

// helpers
function pad2(n) { return n.toString().padStart(2, '0'); }
function formatDateTime(d) {
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
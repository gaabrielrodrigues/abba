import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pg;
const JWT_SECRET = 'supersecretkey123';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

// Helper: Add months to a date
const addMonths = (dateStr, months) => {
    const d = new Date(dateStr);
    const day = d.getUTCDate();
    d.setUTCMonth(d.getUTCMonth() + months);
    if (d.getUTCDate() !== day) {
        d.setUTCDate(0);
    }
    return d.toISOString().split('T')[0];
};

const initDb = async () => {
    try {
        const client = await pool.connect();

        await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(10) CHECK (status IN ('paid', 'pending')) NOT NULL,
        date DATE NOT NULL
      );
    `);

        // Add card_id column if it doesn't exist
        await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'transactions' AND column_name = 'card_id'
        ) THEN
          ALTER TABLE transactions ADD COLUMN card_id VARCHAR(50);
        END IF;
      END $$;
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        label VARCHAR(50) NOT NULL,
        icon VARCHAR(10) NOT NULL,
        color VARCHAR(20) NOT NULL,
        type VARCHAR(10) NOT NULL
      );
    `);

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );
    `);

        // Create credit cards table
        await client.query(`
      CREATE TABLE IF NOT EXISTS credit_cards (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        card_limit NUMERIC(10, 2) NOT NULL,
        closing_day INTEGER NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
        due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
        color VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        const userCheck = await client.query("SELECT * FROM users WHERE username = 'admin'");
        if (userCheck.rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
            console.log('Default user created: admin / admin123');
        }

        console.log('Database initialized successfully');
        client.release();
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

initDb();

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
            [username, hashedPassword]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({ token, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid password' });
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- Categories Routes ---
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

app.post('/api/categories', async (req, res) => {
    const { id, label, icon, color, type } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO categories (id, label, icon, color, type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, label, icon, color, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating category' });
    }
});

// --- Transaction Routes ---
app.get('/api/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/transactions', async (req, res) => {
    const { description, amount, type, category, status, date, cardId, isRecurrent, recurrenceType, recurrenceCount } = req.body;

    console.log('📥 Backend recebeu transação:', { description, amount, type, category, status, date, cardId });

    try {
        const responseData = [];
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Determine number of iterations
            // If not recurrent: 1
            // If recurrent & installments: recurrenceCount
            // If recurrent & permanent: generate for 5 years (60 months) as a "permanent" solution
            let iterations = 1;
            if (isRecurrent) {
                if (recurrenceType === 'permanent') iterations = 60;
                else iterations = recurrenceCount || 2;
            }

            for (let i = 0; i < iterations; i++) {
                const currentDate = i === 0 ? date : addMonths(date, i);

                // Status logic: current (first) takes user input, future defaults to 'pending' unless it's income? 
                // Usually future bills are pending.
                const currentStatus = i === 0 ? status : 'pending';

                // Description logic: 
                // If installments: "Netflix (1/12)"
                // If permanent: "Netflix"
                let currentDesc = description;
                if (isRecurrent && recurrenceType === 'installments') {
                    currentDesc = `${description} (${i + 1}/${iterations})`;
                }

                const result = await client.query(
                    'INSERT INTO transactions (description, amount, type, category, status, date, card_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                    [currentDesc, amount, type, category, currentStatus, currentDate, cardId || null]
                );
                responseData.push(result.rows[0]);
            }

            await client.query('COMMIT');
            res.status(201).json(responseData[0]);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/api/transactions/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { description, amount, type, category, status, date, cardId, isRecurrent, recurrenceType, recurrenceCount } = req.body;
    console.log('📝 Atualizando transação:', { id, cardId });

    try {
        const result = await pool.query(
            `UPDATE transactions 
             SET description = $1, amount = $2, type = $3, category = $4, status = $5, date = $6, card_id = $7
             WHERE id = $8
             RETURNING *`,
            [description, amount, type, category, status, date, cardId, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    console.log('🗑️ Backend deletando transação:', id);
    try {
        const result = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            console.log('⚠️ Transação não encontrada no banco');
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Credit Cards Routes ---
app.get('/api/cards', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM credit_cards ORDER BY created_at DESC');
        // Map database columns to frontend format
        const cards = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            limit: parseFloat(row.card_limit),
            closingDay: row.closing_day,
            dueDay: row.due_day,
            color: row.color
        }));
        res.json(cards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching cards' });
    }
});

app.post('/api/cards', async (req, res) => {
    const { id, name, limit, closingDay, dueDay, color } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO credit_cards (id, name, card_limit, closing_day, due_day, color) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, name, limit, closingDay, dueDay, color]
        );
        const card = result.rows[0];
        res.status(201).json({
            id: card.id,
            name: card.name,
            limit: parseFloat(card.card_limit),
            closingDay: card.closing_day,
            dueDay: card.due_day,
            color: card.color
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating card' });
    }
});

app.delete('/api/cards/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // First delete all transactions linked to this card
        await pool.query('DELETE FROM transactions WHERE card_id = $1', [id]);

        // Then delete the card
        await pool.query('DELETE FROM credit_cards WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting card' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

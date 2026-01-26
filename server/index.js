require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global cache for Vercel warm starts
let cachedDb = null;

// Database connection function
async function connectToDatabase() {
    if (cachedDb) {
        return cachedDb;
    }

    if (mongoose.connection.readyState === 1) {
        cachedDb = mongoose.connection;
        return cachedDb;
    }

    const opts = {
        bufferCommands: false,
    };

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, opts);
    cachedDb = mongoose.connection;
    console.log('✅ Connected to MongoDB Atlas');
    return cachedDb;
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    try {
        await connectToDatabase();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'VBAbrew API is running 🚀', version: '1.0.0' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Local Development Support
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`🚀 Server running locally on http://localhost:${PORT}`);
    });
}

// Export for Vercel
module.exports = app;

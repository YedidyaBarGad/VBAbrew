const express = require('express');
const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all chats for user
router.get('/', async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.userId })
            .select('title createdAt updatedAt')
            .sort({ updatedAt: -1 });

        res.json({ chats });
    } catch (error) {
        console.error('Get chats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single chat
router.get('/:id', async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.json({ chat });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new chat
router.post('/', async (req, res) => {
    try {
        const { title, conversationHistory, lastGeneratedCode } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const chat = new Chat({
            userId: req.userId,
            title,
            conversationHistory: conversationHistory || [],
            lastGeneratedCode: lastGeneratedCode || ''
        });

        await chat.save();

        res.status(201).json({ chat });
    } catch (error) {
        console.error('Create chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update chat
router.put('/:id', async (req, res) => {
    try {
        const { title, conversationHistory, lastGeneratedCode } = req.body;

        const chat = await Chat.findOne({ _id: req.params.id, userId: req.userId });

        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        if (title) chat.title = title;
        if (conversationHistory) chat.conversationHistory = conversationHistory;
        if (lastGeneratedCode !== undefined) chat.lastGeneratedCode = lastGeneratedCode;

        await chat.save();

        res.json({ chat });
    } catch (error) {
        console.error('Update chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete chat
router.delete('/:id', async (req, res) => {
    try {
        const result = await Chat.deleteOne({ _id: req.params.id, userId: req.userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.json({ message: 'Chat deleted' });
    } catch (error) {
        console.error('Delete chat error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

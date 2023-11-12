const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Search for blog posts
router.post('/search', async (req, res) => {
    try {
        // Get search parameters from request body
        const { keywords, category, author, sortBy, sortOrder } = req.body;

        // Build the search query
        const searchQuery = {};
        if (keywords) {
            searchQuery.$text = { $search: keywords };
        }
        if (category) {
            searchQuery.category = category;
        }
        if (author) {
            searchQuery['comments.author'] = author; // Assuming you want to search by author's username
        }

        // Execute the search query
        const searchResults = await Post.find(searchQuery)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .exec();

        res.json({ results: searchResults });
    } catch (error) {
        console.error('Error in search:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

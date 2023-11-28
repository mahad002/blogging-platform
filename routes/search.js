/**
 * @swagger
 * tags:
 *   name: Search
 *   description: API endpoints for searching blog posts
 */

const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const router = express.Router();
const Post = require('../models/post');

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Search for blog posts
 *     description: Search for blog posts based on filtering and sorting criteria.
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 description: The page number for pagination (default: 1)
 *               pageSize:
 *                 type: integer
 *                 description: The number of posts per page (default: 10)
 *               filter:
 *                 type: string
 *                 description: The category to filter posts by
 *               sortField:
 *                 type: string
 *                 description: The field to sort posts by
 *               sortOrder:
 *                 type: string
 *                 enum: ['asc', 'desc']
 *                 description: The sort order (asc or desc)
 *             required:
 *               - page
 *               - pageSize
 *     responses:
 *       200:
 *         description: Blog posts retrieved successfully.
 *       500:
 *         description: Internal server error.
 */

// Search for blog posts
router.post('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const filter = req.query.filter || '';
        const sortField = req.query.sortField ;
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    
        let query;

        if(filter.length > 0){
            query = Post.find({ category: filter }).skip(skip).limit(pageSize).populate('author');
        }
        else{
            query = Post.find({}).skip(skip).limit(pageSize).populate('author');
        }
        
        if(sortField){
            query = query.sort({ [sortField]: sortOrder });
        }

        const q = await query;

        const posts = q.map(post => {
            return {
                title: post.title,
                content: post.content,
                author: post.author.username,
                creationDate: post.creationDate,
                category: post.category,
                rating: post.ratings.reduce((acc, rating) => acc + rating.value, 0) / post.ratings.length,
            }
        });

        console.log(posts);
    
        res.json(posts);
    } catch (error) {
        console.error('Error during blog post retrieval:', error);
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');

// View all users
router.get('/users', async (req, res) => {
    try {
        const allUsers = await User.find();
        res.json({ users: allUsers });
    } catch (error) {
        console.error('Error in viewing all users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Block/Disable a user
router.post('/block/:userId', async (req, res) => {
    try {
        const userIdToBlock = req.params.userId;

        // Find the user
        const userToBlock = await User.findById(userIdToBlock);
        if (!userToBlock) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update the user's status to blocked
        userToBlock.blocked = true;
        await userToBlock.save();

        console.log(userToBlock);

        res.json({ message: 'User blocked successfully.' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// List all Blog Posts with Title, Author, Creation Date, Average Rating
router.get('/all-posts', async (req, res) => {
    try {
        // Find all users
        const users = await User.find().populate('posts');

        // Iterate through each user
        for (const user of users) {
            // Iterate through each post of the user
            for (const post of user.posts) {
                // Calculate Average Rating
                const totalRatings = post.ratings.length;
                const sumRatings = post.ratings.reduce((sum, rating) => sum + rating.value, 0);
                const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

                // Print Post
                console.log('Title:', post.title);
                console.log('Author:', user.username);
                console.log('Comments:', post.comments.map(comment => comment.text));
                console.log('Average Rating:', averageRating.toFixed(2)); // Round to 2 decimal places
                console.log('------------------------');
            }
        }

        res.json({ message: 'All user posts listed successfully.' });
    } catch (error) {
        console.error('Error listing all user posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// View a Particular Blog Post by Post ID
router.get('/post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;

        // Search for the post in each user's posts
        let postAuthorUsername = 'Unknown';

        const users = await User.find();

        for (const user of users) {
            const post = user.posts.find(post => post.equals(postId));
            if (post) {
                postAuthorUsername = user.username;
                break;
            }
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Calculate Average Rating
        const totalRatings = post.ratings.length;
        const sumRatings = post.ratings.reduce((sum, rating) => sum + rating.value, 0);
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        // Prepare the response object
        const postDetails = {
            title: post.title,
            content: post.content,
            category: post.category,
            author: postAuthorUsername,
            comments: post.comments.map(comment => ({
                text: comment.text,
                author: comment.author.username,
            })),            
            averageRating: averageRating.toFixed(2),
        };

        res.json({ message: 'Blog post details retrieved successfully.', post: postDetails });
    } catch (error) {
        console.error('Error viewing blog post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Disable a blog
router.post('/disable-post/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        post.disabled = true;
        await post.save();

        res.json({ message: 'Post disabled successfully.' });
    } catch (error) {
        console.error('Error disabling post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
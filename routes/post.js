/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: API operations related to blog posts
 */

const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const router = express.Router();
const AuthMiddleware = require('../middlewares/UserAuth');
const Post = require('../models/post');
const User = require('../models/user');

/**
 * @swagger
 * /post/create:
 *   post:
 *     summary: Create a new blog post
 *     description: Create a new blog post and associate it with the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Blog post created successfully.
 *       401:
 *         description: Authentication failed: User not found.
 *       500:
 *         description: Internal server error.
 */

// Create a new blog post
router.post('/create', AuthMiddleware, async (req, res) => {
    try {
        const { title, content, category, disabled, creationDate, pictures, author, comments, ratings } = req.body;

        // Create a new post
        const newPost = new Post({
            title,
            content,
            category,
            disabled,
            creationDate,
            pictures,
            author,
            comments,
            ratings,
        });

        // Associate the post with the user
        console.log(req.body.user, "Printed");
        const user = req.body.user;

        if (!user) {
            console.error('User not found');
            res.status(401).json({ error: 'Authentication failed: User not found' });
            return; // Exit the function here
        }
        console.log("Author:" , newPost.author);
        // Save the post
        await newPost.save();

        console.log('becbvre');

        user.posts = user.posts || []; // Ensure posts array exists
        console.log('becbvre');
        user.posts.push(newPost._id); // Add the post ID to the user's posts array
        console.log('becbvre');
        await user.save();
        console.log('becbvre');
        res.json({ message: 'Blog post created successfully.'});
        console.log('becbvre');
    } catch (error) {
        console.error('Error creating blog post:', error);

        // Check if headers have already been sent
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get posts for a specific user
 *     description: Retrieve posts for the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User and posts retrieved successfully.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

// Get posts for a specific user
router.get('/', AuthMiddleware, async (req, res) => {
    console.log(req.body.user);
    try {
        if (!req.body || !req.body.user) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        
        // const userId = req.body.user._id;
        console.log(req.body.user);
        const user = await User.findById(req.body.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Assuming the user model has an array of post IDs
        const postIds = await Post.find();

        // Query the posts based on the post IDs
        const posts = await Post.find({ _id: { $in: postIds } });

        console.log("Posts:", posts);

        res.json({ user, posts });
    } catch (err) {
        console.error('Error in getting user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /post/{postId}:
 *   get:
 *     summary: Get a specific blog post by ID
 *     description: Retrieve a specific blog post by its ID.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog post to retrieve.
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

// Get a specific blog post by ID
router.get('/:postId', AuthMiddleware, async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find the post by ID
        const post = await Post.findById(postId);

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // // Check if the post exists and if the authenticated user has permission to view the post
        // if (!post.author || !post.author.equals(req.body.user._id)) {
        //     return res.status(403).json({ message: 'Unauthorized: You do not have permission to view this post.' });
        // }

        res.json({ post });
    } catch (err) {
        console.error('Error in getting blog post by ID:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /post/update/{postId}:
 *   put:
 *     summary: Update a blog post
 *     description: Update the title of a specific blog post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The new title of the blog post
 *             required:
 *               - title
 *     responses:
 *       200:
 *         description: Blog post updated successfully.
 *       404:
 *         description: User or post not found.
 *       500:
 *         description: Internal server error.
 */
  
// Update a blog post
router.put('/update/:postId', AuthMiddleware, async (req, res) => {
    try {
        console.log("working");
        // const userId = req.user.userId;
        console.log("working");
        // const postId = req.params.postId;
        console.log("working");
        const { title, content } = req.body;
        console.log("working");

        // Find the user by ID
        const user = await User.findById(req.body.user._id);

        console.log("working");
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Find the index of the post in the user's posts array
        const postIndex = user.posts.findIndex(post => post._id.toString() === req.params.postId);
        console.log(user.posts[postIndex]);
        const post = await Post.findById(user.posts[postIndex]);
        console.log(post);
        // Check if the post exists
        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        // console.
        // Update the post data
        post.title = req.body.title;
        // user.posts[postIndex].content = content || user.posts[postIndex].content;

        console.log(post);

        // Save the updated user
        await post.save();

        res.json({ message: 'Post updated successfully.', post: user.posts[postIndex] });
    } catch (err) {
        console.error('Error in updating post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /post/delete/{postId}:
 *   delete:
 *     summary: Delete a specific user's post
 *     description: Delete a specific blog post associated with the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog post to delete.
 *     responses:
 *       200:
 *         description: Blog post deleted successfully.
 *       404:
 *         description: User or post not found.
 *       500:
 *         description: Internal server error.
 */


// Delete a specific user's post
router.delete('/delete/:postId', AuthMiddleware, async (req, res) => {
    try {
        // const userId = req.body.user._Id;
        // const postId = req.params.postId;

        // Find the user by ID
        const user = await User.findById(req.body.user._id);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Find the index of the post in the user's posts array
        const postIndex = user.posts.findIndex(post => post._id.toString() === req.params.postId);

        // Check if the post exists
        if (postIndex === -1) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Remove the post from the user's posts array
        const deletedPost = user.posts.splice(postIndex, 1);

        // Save the updated user
        await user.save();

        res.json({ message: 'Post deleted successfully.', deletedPost: deletedPost[0] });
    } catch (err) {
        console.error('Error in deleting post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// // Get all blog posts with pagination and filtering
// router.get('/posts', AuthMiddleware, async (req, res) => {
//     try {
//         console.log("i'm In1");
//         // Pagination parameters
//         // const page = req.query.page || 1;
//         // const pageSize = req.query.pageSize || 10;

//         const category = req.body.category;
//         const sortBy = req.query.sortBy || 'createdAt'; 
//         // console.log(req.body.user);
        
//         const user = await User.findById(req.body.user._id)
//             .populate({
//                 path: 'posts',
//                 select: 'title content createdAt',
//                 match: {
//                     category: category 
//                 },
//                 options: {
//                     sort: { [sortBy]: -1 },
//                     // skip: (page - 1) * pageSize,
//                     limit: parseInt(pageSize)
//                 }
//             });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.json(user.posts);
//     } catch (err) {
//         console.error('Error in getting blog posts:', err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// Add a comment to a blog post
// router.post('/comment/:postId', AuthMiddleware, async (req, res) => {
//     try {
//         const { text } = req.body;
//         const postId = req.params.postId;

//         // Find the post
//         const post = await Post.findById(postId);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found.' });
//         }

//         // Add the comment
//         const newComment = {
//             text,
//             author: req.body.user._id, // Set the author as the authenticated user
//         };

//         post.comments.push(newComment);

//         await post.save();

//         res.json({ message: 'Comment added successfully.', comment: newComment });
//     } catch (error) {
//         console.error('Error adding comment:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// I can also do this '/comment/:postId/:userId'
// Add a comment to a blog post

/**
 * @swagger
 * /post/comment/{postId}:
 *   post:
 *     summary: Add a comment to a blog post
 *     description: Add a comment to a specific blog post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog post to add a comment to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment added successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

router.post('/comment/:postId', AuthMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.postId;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const commentAuthor = await User.findById(req.body.user._id);

        // Add the comment
        post.comments.push({
            text,
            author: commentAuthor._id, // Set the author as the authenticated user
        });

        await post.save();

        // Generate notification
        const notification = {
            text: `${commentAuthor.username} commented on your post: "${post.title}".`,
            from: commentAuthor._id,
            read: false,
        };

        console.log("Notifications: ",notification);

        // Add the notification to the post author's notifications
        const postAuthor = await User.findOne({ posts: postId });
        postAuthor.notifications.push({text: notification.text,from: notification.from,read: notification.read});
        await postAuthor.save();

        res.json({ message: 'Comment added successfully.', post });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /post/rate/{postId}:
 *   post:
 *     summary: Add a rating to a blog post
 *     description: Add a rating to a specific blog post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the blog post to add a rating to.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
 *     responses:
 *       200:
 *         description: Rating added successfully.
 *       400:
 *         description: You have already rated this post.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

//'/rate/:postId/:userId'
// Add a rating to a blog post
router.post('/rate/:postId', AuthMiddleware, async (req, res) => {
    try {
        const postId = req.params.postId;

        // Find the post
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const ratingAuthor = await User.findById(req.body.user._id);
        const { value } = req.body;

        // Check if the user has already rated the post
        const existingRating = post.ratings.find(rating => rating.author.equals(ratingAuthor._id));

        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this post.' });
        }

        // Add the rating
        post.ratings.push({
            value: value || 1, // Default to 1 if value is not provided
            author: ratingAuthor._id,
        });

        await post.save();

        // Generate notification
        const notification = {
            text: `${ratingAuthor.username} rated your post: ${post.title} with ${value || 1} stars.`,
            from: ratingAuthor._id,
            read: false,
        };

        console.log("Notifications: ", notification);

        // Add the notification to the post author's notifications
        const postAuthor = await User.findOne({ posts: postId });
        const text = `${ratingAuthor.username} rated your post: ${post.title} with ${value || 1} stars.`;
        const from = ratingAuthor._id;
        const read =  false;
        console.log(postAuthor);

        postAuthor.notifications.push({
            text: text,
            from: from,
            read: read,
        });
        await postAuthor.save();
        
        console.log("Notifications: efvewgew");

        res.json({ message: 'Rating added successfully.', post });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

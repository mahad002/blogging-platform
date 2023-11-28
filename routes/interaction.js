/**
 * @swagger
 * tags:
 *   name: Interaction
 *   description: API endpoints for user interactions.
 */

const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const AuthMiddleware = require('../middlewares/UserAuth');

/**
 * @swagger
 * /interaction/profile/follow/{userId}:
 *   post:
 *     summary: Follow a blogger
 *     description: Follow a blogger by providing the blogger's user ID.
 *     tags: [Interaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the blogger to follow.
 *     responses:
 *       200:
 *         description: Successfully followed the blogger.
 *       400:
 *         description: Bad request or user is already following the blogger.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: User to follow not found.
 *       500:
 *         description: Internal server error.
 */

// Follow a blogger
router.post('/profile/follow/:userId', AuthMiddleware, async (req, res) => {
    try {
        const userIdToFollow = req.params.userId;
        const userId = req.body.user._id;  // Assuming userId is the ObjectId

        // Check if the user is trying to follow themselves
        if (userId.equals(userIdToFollow)) {
            return res.status(400).json({ message: "You can't follow yourself." });
        }

        // Check if the user to follow exists
        const userToFollow = await User.findById(userIdToFollow);
        if (!userToFollow) {
            return res.status(404).json({ message: 'User to follow not found.' });
        }

        // Check if the user is already following the blogger
        if (req.body.user.following.includes(userIdToFollow)) {
            return res.status(400).json({ message: 'You are already following this blogger.' });
        }

        // Update the following list for the current user
        req.body.user.following.push(userIdToFollow);
        await req.body.user.save();

        // Update the followers list for the user to follow
        userToFollow.followers.push(userId);
        // await userToFollow.save();

        // We will add notifications
        const notification = {
            text: `${req.body.user.username} started following you.`,
            from: userId,
            read: false,
        };

        console.log("Notifications: ", notification);
        userToFollow.notifications.push({
            text: notification.text,
            from: req.body.user,  // Convert userId to ObjectId
            read: notification.read,
        });
        await userToFollow.save();

        res.json({ message: 'Successfully followed the blogger.' });
    } catch (error) {
        console.error('Error following blogger:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /interaction/profile/unfollow/{userId}:
 *   post:
 *     summary: Unfollow a blogger
 *     description: Unfollow a blogger by providing the blogger's user ID.
 *     tags: [Interaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the blogger to unfollow.
 *     responses:
 *       200:
 *         description: Successfully unfollowed the blogger.
 *       400:
 *         description: Bad request or user is not following the blogger.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: User to unfollow not found.
 *       500:
 *         description: Internal server error.
 */


// Unfollow a blogger
router.post('/profile/unfollow/:userId', AuthMiddleware, async (req, res) => {
    try {
        const userIdToUnfollow = req.params.userId;
        const userId = req.body.user?._id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Check if the user is trying to unfollow themselves
        if (userId.equals(userIdToUnfollow)) {
            return res.status(400).json({ message: "You can't unfollow yourself." });
        }

        // Check if the user to unfollow exists
        const userToUnfollow = await User.findById(userIdToUnfollow);
        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User to unfollow not found.' });
        }

        // Check if the user is already not following the blogger
        if (!req.body.user.following || !req.body.user.following.includes(userIdToUnfollow)) {
            return res.status(400).json({ message: 'You are not following this blogger.' });
        }

        // Update the following list for the current user
        req.body.user.following = req.body.user.following.filter(id => !id.equals(userIdToUnfollow));
        await req.body.user.save();

        // Update the followers list for the user to unfollow
        userToUnfollow.followers = userToUnfollow.followers.filter(id => !id.equals(userId));
        await userToUnfollow.save();

        res.json({ message: 'Successfully unfollowed the blogger.' });
    } catch (error) {
        console.error('Error unfollowing blogger:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * @swagger
 * /interaction/profile/{userId}:
 *   get:
 *     summary: Get user profile and posts if the requester is following
 *     description: Get user profile and posts for a specific user if the requester is following that user.
 *     tags: [Interaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to access.
 *     responses:
 *       200:
 *         description: User profile and posts.
 *       401:
 *         description: User is not following the requested user. Access denied.
 *       404:
 *         description: User to access not found.
 *       500:
 *         description: Internal server error.
 */

// Get user profile and posts if the requester is following
router.get('/profile/:userId', AuthMiddleware, async (req, res) => {
    try {
        const userIdToAccess = req.params.userId;
        const userId = req.body.user._id;

        // Check if the user to access exists
        const userToAccess = await User.findById(userIdToAccess);
        if (!userToAccess) {
            return res.status(404).json({ message: 'User to access not found.' });
        }

        // Check if the requester is following the user to access
        const isFollowing = userToAccess.followers.includes(userId);

        if (!isFollowing) {
            return res.status(401).json({ message: 'You are not following this user. Access denied.' });
        }

        // If the requester is following, fetch the user's posts
        const userPosts = await Post.find({ author: userIdToAccess });

        res.json({ user: userToAccess, posts: userPosts });
    } catch (error) {
        console.error('Error accessing user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;

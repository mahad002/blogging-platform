/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthMiddleware = require('../middlewares/UserAuth');
const Post = require('../models/post');
require('dotenv').config();
const Secret = process.env.SECRET_KEY;

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with a unique email address and a hashed password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Email is already registered.
 *       500:
 *         description: Internal server error.
 */

// Register
router.post('/register', async (req, res) => {
    try{
        console.log('hello');
        const {username, email, password } = req.body;
        const userExist = await User.findOne({ email });
        if(userExist){
            return res.status(400).json({ message: 'Email is already Registered!'});
        }   
        
        console.log('hello');
        const salt = await bcrypt.genSalt(10); //we can also put 10 rather than salt
        const hashedPassword = await bcrypt.hash(password, salt);
        
        console.log('hello');
        const newUser = new User ({username, email, password: hashedPassword, roles: ['user']});
        await newUser.save();
        
        console.log('hello');
        res.status(201).json({message: 'User Registered Successfully!'});
    } catch(error) {
        console.log("Error: ", error);
        res.status(500).json({error: 'Internal Server Error!'});
    }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     description: Log in a user with a registered email and password.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token.
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: 'Invalid Credentials!'});
        }

        // // Check if the user is blocked
        // if (user.blocked) {
        //     return res.status(403).json({ message: 'Access denied. Your account is deactivated.' });
        // }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({message: 'Invalid Credentials!'});
        }

        const token = jwt.sign({ userId: user._id }, Secret, { expiresIn: '1h' });

        // res.status(200).json({message: 'Login Successful!', token});
        return res.status(200).json({ token, user: { id: user._id, name: user.username, roles: user.roles}});
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({error: 'Internal Server Error!'});
    }
});

/**
 * @swagger
 * /user/{userId}/posts:
 *   get:
 *     summary: Get posts by user ID
 *     description: Get posts associated with a specific user ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to get posts for.
 *     responses:
 *       200:
 *         description: Posts retrieved successfully.
 *       404:
 *         description: User not found or no posts found for the user.
 *       500:
 *         description: Internal server error.
 */

// Define a new route that accepts a GET request and a user ID as a parameter
router.get('/:userId/posts', async (req, res) => {
    try {
        // Use the User and Post models to find the user and their associated posts
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const posts = await Post.find({ author: user._id });
        if (posts.length === 0) {
            return res.status(404).json({ error: 'No posts found for this user' });
        }

        // Return the posts in the response
        return res.json(posts);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get the profile of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

// Retrieving user profile
router.get('/profile', AuthMiddleware, async (req, res) => {
    console.log("Hello");
    console.log("req.body:", req.body);
    console.log("req.body.username:", req.body.user.username);
  
    try {
        if (!req.body.user || !req.body.user.username) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        console.log("Hello");
        const user = await User.findById(req.body.id);
        console.log("Hello");
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log("Hello");
        res.json(user);
    } catch (err) {
        console.error('Error in getting user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     description: Get the profile of a user by their ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to get profile for.
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

// Retrieving user profile
router.get('/:userId', async (req, res) => {
    console.log("Hello");
    console.log("req.params.userId: ", req.params.userId);
  
    try {
        console.log("Hello");
        const user = await User.findById(req.params.userId);
        console.log("Hello");
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log("Hello");
        res.json(user);
    } catch (err) {
        console.error('Error in getting user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
  });

 /**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
  
// Update user profile
router.put('/profile', AuthMiddleware, async (req, res) => {
    console.log("Hi");
    try {
        // Extract user ID from the authenticated user
        console.log(req.body.user);
        const userId = req.body.user._id;
        console.log(userId);

        // Extract data from the request body
        const { name, email, password } = req.body.user;

        // Find the user by ID
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // // Check if the user is blocked
        // if (user.blocked) {
        //     return res.status(403).json({ message: 'Access denied. Your account is deactivated.' });
        // }

        // Hash the new password if provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update user data
        user.name = name || user.name;  // Update only if a new name is provided
        user.email = email || user.email;  // Update only if a new email is provided
        if (hashedPassword) {
            user.password = hashedPassword;  // Update password only if a new password is provided
        }

        // Save the updated user
        await user.save();

        res.json({ message: 'User profile updated successfully.' });
    } catch (err) {
        console.error('Error in updating user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /user/update:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       401:
 *         description: User not authenticated.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

//Update Profile
router.put('/update', AuthMiddleware, async (req, res) => {
    try {
        // Extract user ID from the authenticated user
        const userId = req.body.user._id;

        // Extract data from the request body
        const { name, email, password } = req.body.user;

        // Find the user by ID
        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // // Check if the user is blocked
        // if (user.blocked) {
        //     return res.status(403).json({ message: 'Access denied. Your account is deactivated.' });
        // }

        // Hash the new password if provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update user data
        user.name = name || user.name;  // Update only if a new name is provided
        user.email = email || user.email;  // Update only if a new email is provided
        if (hashedPassword) {
            user.password = hashedPassword;  // Update password only if a new password is provided
        }

        // Save the updated user
        await user.save();

        res.json({ message: 'User profile updated successfully.' });
    } catch (err) {
        console.error('Error in updating user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;
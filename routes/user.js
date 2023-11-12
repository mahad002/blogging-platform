const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthMiddleware = require('../middlewares/UserAuth');
const Post = require('../models/post');
require('dotenv').config();
const Secret = process.env.SECRET_KEY;

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

router.post('/login', async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: 'Invalid Credentials!'});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({message: 'Invalid Credentials!'});
        }

        const token = jwt.sign({ userId: user.pid }, Secret, { expiresIn: '1h' });

        res.status(200).json({message: 'Login Successful!', token});
        return res.status(200).json({ token, user: { id: user.pid, name: user.name, roles: user.roles}});
    } catch (error) {
        console.log("Error: ", error);
        res.status(500).json({error: 'Internal Server Error!'});
    }
});

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

  // Update user profile
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
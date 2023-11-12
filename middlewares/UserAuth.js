const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const Secret = process.env.SECRET_KEY;

const UserAuth = async (req, res, next) => {
const token = req.header('Authorization')?.replace('Bearer ', ''); 

  try {
    if (!token) {
      console.error('Token not provided');
      return res.status(401).json({ error: 'Authentication failed: Token not provided' });
    }

    console.log('Received token:', token);
    const decoded = jwt.verify(token, Secret);
    console.log('Decoded token:', decoded);

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.error('Token expired');
      return res.status(401).json({ error: 'Authentication failed: Token expired' });
    }

    const user = await User.findOne({ _id: decoded.userId });
    console.log('User found in database:', user);

    if (!user) {
        console.log("this one");
      console.error('User not found');
      return res.status(401).json({ error: 'Authentication failed: User not found' });
    }

    // req.token = token;
    req.body.user = user;
    // res.json(user);
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = UserAuth;

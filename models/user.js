/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email address of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: The roles assigned to the user
 *         blocked:
 *           type: boolean
 *           description: Indicates if the user is blocked
 *         token:
 *           type: string
 *           description: Token associated with the user (optional)
 *         following:
 *           type: array
 *           items:
 *             type: string
 *           description: Users that the current user is following
 *         followers:
 *           type: array
 *           items:
 *             type: string
 *           description: Users who are following the current user
 *         notifications:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Notification'
 *           description: Notifications for the user
 *         posts:
 *           type: array
 *           items:
 *             type: string
 *           description: Blog posts created by the user
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           description: The text content of the notification
 *         from:
 *           type: string
 *           description: The ID of the user who triggered the notification
 *         read:
 *           type: boolean
 *           description: Indicates if the notification has been read
 */

const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    roles: [String],
    blocked: Boolean,
    token: { type: String, required: false },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    notifications: [{
        text: String,
        from: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        read: Boolean,
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    }],
});

module.exports = mongoose.model('User', userSchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the blog post
 *         content:
 *           type: string
 *           description: The content of the blog post
 *         category:
 *           type: string
 *           description: The category of the blog post
 *         disabled:
 *           type: boolean
 *           description: Indicates if the blog post is disabled
 *         creationDate:
 *           type: string
 *           format: date-time
 *           description: The creation date of the blog post
 *         pictures:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL of the image
 *         author:
 *           type: string
 *           description: The ID of the author of the blog post
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: Comments associated with the blog post
 *         ratings:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Rating'
 *           description: Ratings given to the blog post
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *           description: The text of the comment
 *         author:
 *           type: string
 *           description: The ID of the author of the comment
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Rating:
 *       type: object
 *       properties:
 *         value:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: The value of the rating (e.g., number of stars)
 *         author:
 *           type: string
 *           description: The ID of the author of the rating
 */

const express = require('express'),
bodyParser = require("body-parser"),
swaggerJsdoc = require("swagger-jsdoc"),
swaggerUi = require("swagger-ui-express");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: String,
    content: String,
    category: String,
    disabled: Boolean,
    creationDate: { type: Date, default: Date.now }, 
    pictures: [{
        url: String, // URL of the image
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    comments: [{
        text: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    }],
    ratings: [{
        value: {
            type: Number,
            min: 1, 
            max: 5,
            //I have set a max and min so allowed values are added only
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    }],
});

module.exports = mongoose.model('Post', postSchema);

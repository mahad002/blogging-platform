const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: String,
    content: String,
    category: String,
    disabled: Boolean,
    // creationDate: { type: Date, default: Date.now }, 
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

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    roles: [String],
    blocked: Boolean,
    uid: mongoose.Schema.Types.ObjectId,
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
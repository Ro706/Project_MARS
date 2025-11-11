const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const ChatSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: [MessageSchema],
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chat', ChatSchema);

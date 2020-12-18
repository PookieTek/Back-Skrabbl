const mongoose = require('mongoose');

const playerSchema = mongoose.Schema({
    pseudo: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
    },
    hand: {
        type: String,
        default: ""
    },
    owner: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('players', playerSchema);
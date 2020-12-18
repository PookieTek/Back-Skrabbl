const mongoose = require('mongoose');
const shortid = require('shortid');

const roomSchema = mongoose.Schema({
    linkId: {
        type: String,
        required: true,
        unique: true,
        default: shortid.generate
    },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "players"
    }],
    joinable: {
        type: Boolean,
        default: true
    },
    board: [{
        empty: Boolean,
        x: Number,
        y: Number,
        value: String,
        joker: Boolean,
        wordMultiple : Number,
        letterMultiple : Number,
    }],
    turn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "players",
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    turn_begin: {
        type: Date,
    },
    pool: {
        type: String
    },
    turn_duration: {
        type: Number,
        default: 20
    },
    dictionnary: {
        type: String,
    },
});

module.exports = mongoose.model('Room', roomSchema);
const mongoose = require('mongoose');

const dicoSchema = mongoose.Schema({
    word: {
        type: String,
        required: true,
    },
    definition: {
        type: String,
        required: true,
    }
});

const dicoEnSchema = mongoose.Schema({
    word: {
        type: String,
        required: true,
    },
    definition: {
        type: String,
        required: true,
    }
});

const frdico = mongoose.model('Dico', dicoSchema);
const endico = mongoose.model('EnDico', dicoEnSchema);
module.exports = {
    DicoFR: frdico,
    DicoEN: endico
}
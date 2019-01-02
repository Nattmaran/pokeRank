var mongoose = require('mongoose');

var Pokemon = new mongoose.Schema({
    id: Number,
    name: {
        enligsh: String,
        japanese: String,
        chinese: String
    },
    type: Object,
    base: Object
}, { collection: 'pokedex'});

module.exports = mongoose.model('Pokedex',Pokemon);
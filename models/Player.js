var mongoose = require('mongoose');

var Player = new mongoose.Schema({
    name: String
},{collection: 'players'});

module.exports = mongoose.model('Player',Player);
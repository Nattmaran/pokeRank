var mongoose = require('mongoose');

var Type = new mongoose.Schema({}, {collection: 'types'});

module.exports = mongoose.model('Type', Type);
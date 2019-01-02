var mongoose = require('mongoose');

var PartyPokemon = new  mongoose.Schema({
    pokemon_id: Number,
    player_name: String
}, {collection:'party_pokemon'});

module.exports = mongoose.model('Party_Pokemon',PartyPokemon);
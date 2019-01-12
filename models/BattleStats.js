var mongoose = require('mongoose');

var BattleStats = new mongoose.Schema({
    player_name: String,
    p1_id: {type:mongoose.Schema.Types.ObjectId,ref:'PartyPokemon'},
    p2_id: {type:mongoose.Schema.Types.ObjectId,ref:'PartyPokemon'},
    p3_id: {type:mongoose.Schema.Types.ObjectId,ref:'PartyPokemon'},
    p4_id: {type:mongoose.Schema.Types.ObjectId,ref:'PartyPokemon'},
    opponent_id: {type:mongoose.Schema.Types.ObjectId,ref:'Pokemon'},
    stats: {
        wins: Number,
        losses: Number
    }
}, {collection: 'battle_stats'});

module.exports = mongoose.model('Battle_Stats', BattleStats);
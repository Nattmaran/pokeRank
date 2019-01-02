var mongoose = require('mongoose');

var BattleStats = new mongoose.Schema({
    player_name: String,
    p1_id: Number,
    p2_id: Number,
    p3_id: Number,
    p4_id: Number,
    opponent_id: Number,
    stats: {
        wins: Number,
        losses: Number
    }
}, {collection: 'battle_stats'});

module.exports = mongoose.model('Battle_Stats', BattleStats);
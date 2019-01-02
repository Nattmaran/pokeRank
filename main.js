var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var _ = require('lodash');

var mongodb = "mongodb://localhost:27017/pokemon";
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
//connect
var db = mongoose.connection;
//bind to error event
db.on('error', console.error.bind(console, 'MongoDb connection error'));
var app = express();
app.use(bodyParser.json());

var Pokemon = require('./models/Pokemon');
var Player = require('./models/Player');
var PartyPokemon = require('./models/PartyPokemon');
var BattleStats = require('./models/BattleStats');

app.get('/', function (req, res) {
    res.send('PokeRank');
    console.log("Hello World")
});


app.get('/pokemon/:name', function (req, res) {
    var query = Pokemon.find({'name.english': req.params.name});
    query.exec(function (err, docs) {
        res.send(docs[0]);
    });
});


app.get('/player/:name', function (req, res) {
    var query = PartyPokemon.find({'player_name': req.params.name});
    query.exec(function (err, docs) {
        res.send(docs[0]);
    });
});


app.post('/player/:player/pokemon/:name', function (req, res) {
    var pokequery = Pokemon.find({'name.english': req.params.name});
    var playerquery = Player.find({'name': req.params.player});

    playerquery.exec(function (err, docs) {
        if (docs[0] == undefined) {
            const newPlayerObj = new Player({name: req.params.player});
            newPlayerObj.save(function (err, records) {
                if (err) {
                    return res.status(500).send(err);
                }
            });
        }
    });

    pokequery.exec(function (err, docs) {
        if (docs[0] == undefined) {
            res.status(500).send(err);
        } else {
            const partypokemon = new PartyPokemon({pokemon_id: docs[0].id, player_name: req.params.player});

            PartyPokemon.find({pokemon_id: docs[0].id, player_name: req.params.player}).exec(function (err, docs) {
                if (docs[0] == undefined) {
                    partypokemon.save(function (err, docs) {
                        if (err) {
                            res.status(500).send(err);
                        }
                        res.status(201).send(partypokemon);
                    });
                } else {
                    res.status(204).send(partypokemon);
                }
            });
        }
    });
});


app.post('/registerBattle', function (request, res) {
    var body = request.body;

    var player_name = body.player_name;
    var pokemon = body.pokemon;
    var opponents = body.opponents;
    var win = body.win;

    var results = [];
    _.forEach(opponents, function (opponent, n) {
        results = registerBattle(player_name, pokemon.slice(0, 2).sort((f, l) => {
            return f.pokemon_id - l.pokemon_id
        }), pokemon.slice(2).sort((f, l) => {
            return f.pokemon_id - l.pokemon_id
        }), opponent, win);
    });

    res.status(201).send(results);
});

function registerBattle(player, front, back, opponent, win) {
    /*    console.log("=======ENTER REGISTER=======");
        console.log(player);
        console.log(front);
        console.log(back);
        console.log(opponent);
        console.log(win);*/

    var battleStat = {
        player_name: player,
        p1_id: front[0].pokemon_id,
        p2_id: front[1].pokemon_id,
        p3_id: back[0].pokemon_id,
        p4_id: back[1].pokemon_id,
        opponent_id: opponent.pokemon_id,
        stats: {
            wins: win === true ? 1 : 0,
            losses: win === true ? 0 : 1
        }
    };

    BattleStats.find(battleStat,'p1_id p2_id p3_id p4_id opponent_id').exec(function (err, docs) {
        if (docs[0] == undefined) {
            new BattleStats(battleStat).save(function (err, docs) {
                if (err) {
                    return null;
                }
            });
        } else {
            BattleStats.update({
                _id: docs[0]._id,
                wins: docs[0].stats.wins + (win == true ? 1 : 0),
                losses: docs[0].stats.losses + (win == true ? 0 : 1)
            });
        }

        return battleStat;
    });
}

app.listen(3000, () => console.log(`Example app listening on port 3000!`));
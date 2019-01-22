var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var _ = require('lodash');

var mongodb = "mongodb://mongodb:27017/pokemon";
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
//connect
var db = mongoose.connection;
//bind to error event
db.on('error', console.error.bind(console, 'MongoDb connection error'));
var app = express();

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var dir = path.join(__dirname, 'public');
app.use(express.static(dir));

var Pokemon = require('./models/Pokemon');
var Player = require('./models/Player');
var PartyPokemon = require('./models/PartyPokemon');
var BattleStats = require('./models/BattleStats');

app.get('/', function (req, res) {
    res.send('PokeRank');
    console.log("Hello World")
});


app.get('/pokemon/name/:name', function (req, res) {
    console.log("Calling get pokemon with name"); console.log(JSON.stringify(req.params.name));
    var query = Pokemon.find({'name.english': {$regex : "^" + req.params.name}});

    query.exec(function (err, docs) {
        res.send(buildResponseList(docs));
    });
});

app.get('/pokemon/id/:id', function (req, res) {
    console.log("Calling get pokemon with id"); console.log(JSON.stringify(req.params.id));
    var query = Pokemon.find({'id': req.params.id});

    query.exec(function (err, docs) {
        res.send(buildResponseWithThumbnail(docs[0]));
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
    var battleStatFind = {
        player_name: player,
        p1_id: front[0].pokemon_id,
        p2_id: front[1].pokemon_id,
        p3_id: back[0].pokemon_id,
        p4_id: back[1].pokemon_id,
        opponent_id: opponent.pokemon_id
    };

    if (win) {
        BattleStats.findOneAndUpdate(battleStatFind, {$inc: {'stats.wins': 1}})
            .exec(function (err, rowsAffected) {
                if(err) {
                    console.log("Error NONONO!");
                }

                if(rowsAffected == undefined) {
                    createNewBattleStats(player, front, back, opponent, win);
                } else {
                    console.log("updated wins +1");
                }
            });
    } else {
        BattleStats.findOneAndUpdate(battleStatFind, {$inc: {'stats.losses': 1}})
            .exec(function (err, rowsAffected) {
                if(rowsAffected < 1) {
                    createNewBattleStats(player, front, back, opponent, win);
                } else {
                    console.log("updated losses +1");
                }
            });
    }
}

function createNewBattleStats(player, front, back, opponent, win) {
    var battleStatNew = new BattleStats({
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
    });

    battleStatNew.save(function (err,res) {
        if(err) {
            console.log("failed to insert new battle stat");
        } else {
            console.log("inserted new battlestat");
        }
    });
}

function toPokemonThumbnail(id,name){
    var idString = "000"+id;
    idString = idString.substring(idString.length-3);
    return path.join('thumbnails',idString+name+'.png')
}

function toPokemonSprite(id){
    var idString = "000"+id;
    idString = idString.substring(idString.length-3);
    return path.join('sprites',idString+'MS'+'.png')
}

function buildResponseWithThumbnail(pokemon) {
    var filePath = toPokemonThumbnail(pokemon.get("id"),pokemon.get("name.english"));
    return {pokemon,thumbnail:filePath};
}

function buildResponseWithSprite(pokemon) {
    var filePath = toPokemonSprite(pokemon.get("id"),pokemon.get("name.english"));
    return {pokemon,sprite:filePath};
}

function buildResponseList(pokemons) {
    var results = [];
    _.forEach(pokemons, function (pokemon, n) {
        results.push(buildResponseWithSprite(pokemon))
    });
    return {pokemonList:results};
}

app.listen(3001, () => console.log(`Example app listening on port 3001!`));

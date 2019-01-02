var express = require('express');
var mongoose = require('mongoose');

var mongodb = "mongodb://localhost:27017/pokemon";
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
//connect
var db = mongoose.connection;
//bind to error event
db.on('error', console.error.bind(console, 'MongoDb connection error'));
var app = express();

var Pokemon = require('./models/Pokemon');
var Player = require('./models/Player');
var PartyPokemon = require('./models/PartyPokemon');

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


app.post('/player/:player/pokemon/:pokemon/opponent/:opponent/didWin/:won', function (req,res) {

});

app.listen(3000, () => console.log(`Example app listening on port 3000!`));
var express = require('express');
var mongoose = require('mongoose');


var app = express();

var mongodb = "mongodb://localhost:27017/pokemon"
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
//connect
var db = mongoose.connection;
//bind to error event
db.on('error', console.error.bind(console, 'MongoDb connection error'));



var schema = new mongoose.Schema({},{collection: 'pokedex'});

var Pokemon = mongoose.model('Pokedex',schema);

app.get('/', function (req,res){
	res.send('Hello World');
});

app.get('/pokemon/:name', function(req,res){
	var query = Pokemon.find({'name.english': req.params.name});
	query.exec(function(err,docs){
		res.send(docs[0]);
	});
});

app.listen(3000,function(){
	console.log('Listening on port 3000');
});

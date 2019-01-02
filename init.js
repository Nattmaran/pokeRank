var mongoose = require('mongoose');

var mongodb = "mongodb://localhost:27017/pokemon"
mongoose.connect(mongodb);
mongoose.Promise = global.Promise;
//connect
var db = mongoose.connection;
//bind to error event
db.on('error', console.error.bind(console, 'MongoDb connection error'));



var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var routes     = require('./app/routes/index');
var Promise = require('bluebird');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port     = process.env.PORT || 8080;

//var mongoose   = require('mongoose');
var mongoose = Promise.promisifyAll(require('mongoose'));

mongoose.connect('localhost:27017/powerci');

routes(app, express);
app.listen(port);
console.log('Magic happens on port ' + port);

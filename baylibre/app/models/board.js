var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BoardSchema   = new Schema({
    name: String,
    manufacturer: String,
    model: String,
    image: String
});

module.exports = mongoose.model('Board', BoardSchema);

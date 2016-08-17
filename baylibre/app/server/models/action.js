var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var actionSchema   = new Schema({
    title: String,
    // Controller name + _ + method name
    technical_title: String
});

module.exports = mongoose.model('Action', actionSchema);

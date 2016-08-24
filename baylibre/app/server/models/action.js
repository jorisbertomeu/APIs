var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var actionSchema   = new Schema({
    title: String,
    description: String,
    technical_title: String // Controller name + _ + method name
});

module.exports = mongoose.model('Action', actionSchema);

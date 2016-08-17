var mongoose     = require('mongoose');
var Schema       = mongoose.Schema, ObjectId = Schema.ObjectId;

var CustomerSchema   = new Schema({
    name: String,
    company: String,
    address: String,
    telephone: String,
    user_id : ObjectId
});

module.exports = mongoose.model('Customer', CustomerSchema);

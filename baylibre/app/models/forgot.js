var mongoose     = require('mongoose');
var Schema       = mongoose.Schema, ObjectId = Schema.ObjectId;

var ForgotSchema   = new Schema({
    username: String,
    date: Number,
    hash: String,
    user_id: ObjectId,
    ip: String
});

module.exports = mongoose.model('Forgot', ForgotSchema);

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema, ObjectId = Schema.ObjectId;

var UserSchema   = new Schema({
    username: String,
    password: String,
    email: String,
    created_on: Number,
    isAdmin: Boolean,
    customers_id: [ObjectId],
    user_tokens: [String]
});

module.exports = mongoose.model('User', UserSchema);

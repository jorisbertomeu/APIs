var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	first_name: String,
	last_name: String,
    username: String,
    password: String,
    email: String,
    phone: String,
    isAdmin: Boolean,
    avatar : String,
    created_on: Number,
    user_tokens: [String]
});

module.exports = mongoose.model('User', UserSchema);

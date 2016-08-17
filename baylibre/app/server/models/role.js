var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var Action	=	require('../models/action');

var RoleSchema   = new Schema({
	title: String,
	description: String,
	actions_list:[{type: Number, ref: 'Action'}]

});

module.exports = mongoose.model('Role', RoleSchema);
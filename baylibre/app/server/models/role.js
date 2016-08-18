var mongoose    = require('mongoose');
var Schema     	= mongoose.Schema;
var ObjectId	= Schema.ObjectId;
var Action	=	require('../models/action');

var RoleSchema   = new Schema({
	title: String,
	description: String,
	actions_list:[{type: ObjectId, ref: 'Action'}]

});

module.exports = mongoose.model('Role', RoleSchema);
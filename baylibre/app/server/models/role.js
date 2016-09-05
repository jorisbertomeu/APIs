var mongoose    = require('mongoose');
var Schema     	= mongoose.Schema;
var ObjectId	= Schema.ObjectId;
var Action	=	require('../models/action');
var Group	=	require('../models/group');
var User	=	require('../models/user');
var User	=	require('../models/board_instance');

var RoleSchema   = new Schema({
	title: String,
	description: String,
	actions_list:[{type: ObjectId, ref: 'Action'}],
	group_id : {type: ObjectId, ref: 'Group'},
	user_id: {type: ObjectId, ref: 'User'},
	board_instance_id: {type: ObjectId, ref: 'Board_instance'}
});

module.exports = mongoose.model('Role', RoleSchema);
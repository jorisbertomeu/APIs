var mongoose 	= require('mongoose');
var Schema		= mongoose.Schema;
var ObjectId 	= Schema.ObjectId;
var User	=	require('../models/user');
var Role	=	require('../models/role');
var Board_instance	=	require('../models/board_instance');
var user_group_roles	=	require('../models/user_group_roles');

var groupSchema	= new Schema({
	name: String,
	description: String,
	users : [{user: {type: ObjectId, ref: 'User'}, role: {type: ObjectId, ref: 'Role'}}],
	board_instances: [{type: ObjectId, ref: 'Board_instance'}],
	user_board_role: [{type: ObjectId, ref: 'user_group_roles'}]
	
});

module.exports	= mongoose.model('Group', groupSchema);
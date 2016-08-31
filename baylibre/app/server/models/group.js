var mongoose   			= require('mongoose');
var Schema             	= mongoose.Schema;
var ObjectId   			= Schema.ObjectId;
var User       			= require('../models/user');
var Role       			= require('../models/role');
var Board_instance     	= require('../models/board_instance');
var user_role_board_instance   	= require('../models/user_role_board_instances');


var groupSchema	= new Schema({
	name						: String,
	description					: String,
	users_role 					: [{user: {type: ObjectId, ref: 'User'}, role: {type: ObjectId, ref: 'Group.list_roles'}}],
	board_instances 			: [{type: ObjectId, ref: 'Board_instance'}],
	user_board_instance_role	: [{type: ObjectId, ref: 'user_role_board_instances'}],
	list_roles					: ['Role']
});

module.exports	= mongoose.model('Group', groupSchema);
var mongoose 	= require('mongoose');
var Schema		= mongoose.Schema;
var ObjectId	= Schema.ObjectId;
var User	=	require('../models/user');
var Group	=	require('../models/group');
var Role	=	require('../models/role');

var UserGroupRoleSchema	= new Schema({
	user_id: {type: ObjectId, ref: 'User'},
	gruoup_id: {type: ObjectId, ref: 'Group'},
	role_id: {type: ObjectId, ref: 'Role'}
});

module.exports	= mongoose.model('user_group_roles', UserGroupRoleSchema);
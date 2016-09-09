var mongoose		= require('mongoose');

var User       		= require('../models/user');
var Role       		= require('../models/role');
var Board_instance  = require('../models/board_instance');

var Schema		= mongoose.Schema;
var ObjectId	= Schema.ObjectId;

var U_R_BISchema = new Schema({
	user_id: {type: ObjectId, ref:'User'},
	role_id: {type: ObjectId, ref: 'Role'},
	board_instance_id: {type: ObjectId, ref: 'Board_instance'}
});

module.exports	= mongoose.model('user_role_board_instances', U_R_BISchema);

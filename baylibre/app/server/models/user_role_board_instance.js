var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;
var ObjectId	= Schema.ObjectId;

var U_R_BISchema = new Schema({
	user_id: ObjectId,
	role_id: ObjectId,
	board_instance_id: ObjectId
});

module.exports	= mongoose.model('user_role_board_instance', U_R_BISchema);

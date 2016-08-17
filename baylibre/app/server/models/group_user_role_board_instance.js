var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;
var ObjectId	= Schema.ObjectId;

var G_U_R_BISchema = new Schema({
	user_id: ObjectId,
	group_ig: ObjectId,
	role_id: ObjectId,
	board_instance_id: ObjectId
});

module.exports	= mongoose.model('group_user_role_boardInstance', G_U_R_BISchema);

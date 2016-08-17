var mongoose 	= require('mongoose');
var Schema		= mongoose.Schema;
var ObjectId 	= Schema.ObjectId;

var groupSchema	= new Schema({
	name: String,
	description: String,
	users : [{user: ObjectId, role: ObjectId}],
	board_instances: [ObjectId],
	user_board_role: [ObjectId]
	
});

module.exports	= mongoose.model('Group', groupSchema);
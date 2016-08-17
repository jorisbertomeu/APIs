var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;
var ObjectId 	= Schema.ObjectId;

// Schema for Sac entity
var SocSchema 	= new Schema({
	title : String,
	sub_title : String,
	description : String,
	logo : String,
	created_on : Number,
	is_new : Boolean,
	nb_views : Number,
	board_id : ObjectId,
	test_case_id : ObjectId
});

module.exports = mongoose.model('soc', SocSchema);
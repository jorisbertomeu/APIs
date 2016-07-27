var mongoose 	 = require('mongoose');
var Schema 		 = mongoose.Schema;

var TestCaseSchema = new Schema({
	status : String,
	title : String,
	description : String,
	target : Number,
	current : Number,
	unit : String,
	trend : String,
	created_on : Number

});


module.exports = mongoose.model("TestCase", TestCaseSchema);
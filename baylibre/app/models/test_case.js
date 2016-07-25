var mongoose 	 = require('mongoose');
var Schema 		 = mongoose.Schema;

var TestCaseSchema = new Schema({
	status : String,
	title : String,
	description : String,
	target : Number,
	current : double,
	unit : String,
	trend : String

});


module.exports = mongoose.model("TestCase", TestCaseSchema);
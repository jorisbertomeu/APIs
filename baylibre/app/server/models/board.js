var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectId 	 = Schema.ObjectId; 

var BoardSchema   = new Schema({
    name: String,
    sub_name : String,
    created_by : ObjectId,
    manufacturer: String,
    model: String,
    image: String,
    created_on : Number,
    nb_units : Number,
    nb_use_cases : Number
});

module.exports = mongoose.model('Board', BoardSchema);

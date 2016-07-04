var mongoose     = require('mongoose');
var Schema       = mongoose.Schema, ObjectId = Schema.ObjectId;

var Board_instanceSchema   = new Schema({
    board_id: ObjectId,
    label: String,
    customer_id: ObjectId,
    lab_id: ObjectId,
    created_on: Number
});

module.exports = mongoose.model('Board_instance', Board_instanceSchema);

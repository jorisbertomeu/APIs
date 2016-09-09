var mongoose     = require('mongoose');
var Schema       = mongoose.Schema, ObjectId = Schema.ObjectId;

var Board_instanceSchema   = new Schema({
    label: String,
    description: String,
    picture: String,
    created_on: Number,
    created_by: ObjectId,
    customer_id: ObjectId,
    lab_id: ObjectId,
    board_id: ObjectId
});

module.exports = mongoose.model('Board_instance', Board_instanceSchema);

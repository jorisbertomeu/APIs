var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var ObjectID     = Schema.ObjectId;

var ProjectSchema   = new Schema({
    description: String,
    customer_id: ObjectID,
    board_instance_id: ObjectID,
    name: String,
    created_on: Number,
    test_suite_id: ObjectID
});

module.exports = mongoose.model('Project', ProjectSchema);
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProjectSchema   = new Schema({
    description: String,
    customer_id: String,
    board_instance_id: String,
    name: String,
    created_on: Number,
    test_suite_id: String
});

module.exports = mongoose.model('Project', ProjectSchema);
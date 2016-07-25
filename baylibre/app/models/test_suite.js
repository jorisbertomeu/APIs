var mongoose     = require('mongoose');
var Schema       = mongoose.Schema, ObjectId = Schema.ObjectId;

var TestSuiteSchema   = new Schema({
    description: String,
    tests_case: [ObjectId]
});

module.exports = mongoose.model('TestSuite', TestSuiteSchema);

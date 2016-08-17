var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var LabSchema   = new Schema({
    name: String,
    lava_url: String,
    short_location: String,
    location_long: String,
    location_lat: String,
    contact: String,
    status: String
});

module.exports = mongoose.model('Lab', LabSchema);

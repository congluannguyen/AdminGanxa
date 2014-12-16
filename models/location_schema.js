var mongoose = require('mongoose');
var schema = mongoose.Schema;
var object_id = schema.ObjectId;

var location_schema = new schema({
    _id: object_id,
    city: String,
    district: []
});

var location = mongoose.model('locations', location_schema);
module.exports = {location: location};
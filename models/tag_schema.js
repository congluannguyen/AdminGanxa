var mongoose = require('mongoose');
var schema = mongoose.Schema;
var object_id = schema.ObjectId;

var tag_schema = new schema({
    _id: object_id,
    tag_name: String
});

var tag = mongoose.model('tags', tag_schema);
module.exports = {tag: tag};
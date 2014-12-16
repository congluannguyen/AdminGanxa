var mongoose = require('mongoose');
var schema = mongoose.Schema;
var object_id = schema.ObjectId;

var media_schema = new schema({
    _id: object_id,
    product_id: String,
    media_name: String,
    media_type: String,
    media_url: String,
    media_date: Date
});

var media = mongoose.model('medias', media_schema);
module.exports = {media: media};
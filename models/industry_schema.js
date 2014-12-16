var mongoose = require('mongoose');
var schema = mongoose.Schema;
var object_id = schema.ObjectId;

var industry_schema = new schema({
    _id: object_id,
    industry_name: String,
    //industry_image: String
});

var industry = mongoose.model('industrys', industry_schema);
module.exports = {industry: industry};
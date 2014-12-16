var express = require('express');
var router = express.Router();
var controllers = require('../controllers/controllers');

router = controllers(router);
module.exports = router;
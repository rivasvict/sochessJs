var express = require('express');
var path = require('path');
var aux = require('../modules/aux');
var router = express.Router();
var environment = aux.trigger;
var switchEnv = environment.target;
var mongoUrl = environment.mongo;
var authTwitterCallback = environment.twitterCallback;





/*router.get('/teist',function(req,res){
	res.sendStatus(200);
});*/

module.exports = router;

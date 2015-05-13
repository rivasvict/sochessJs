var express = require('express');
var path = require('path');
var aux = require('../app/aux');
var router = express.Router();


// SELECTS A SET OF ROUTES BASED ON DE SERVER'S LOCATION
// SET LOCAL FOR LOCAL ENVIRONMENTS OR NOTHING FOR REMOTE ENVIRONMENTS 
var switcher = aux.switchEnv('local');
var switchEnv = switcher.target;
var mongoUrl = switcher.mongo;
var authTwitterCallback = switcher.twitterCallback;

router.get('/teist',function(req,res){
	res.sendStatus(200);
});

module.exports = router;

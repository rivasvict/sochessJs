var express = require('express');
var twitter_module = require('../modules/twitter');
var router = express.Router();
var passport = twitter_module.passport;

router.get('/auth/twitter', passport.authenticate('twitter'));

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));

module.exports = router;

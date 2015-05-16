var express = require('express');

var game;
module.exports = function(_game){
				game = _game;

				var router 					= express.Router();
				var twitter_module 	= require('../modules/twitter');
				var passport 				= twitter_module.passport;

				router.get('/auth/twitter', passport.authenticate('twitter'));

				router.get('/auth/twitter/callback', 
					passport.authenticate('twitter', { successRedirect: '/',
																						 failureRedirect: '/login' }));

				module.exports = router;
				return router;
}

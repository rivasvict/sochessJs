var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var twitterAPI = require('node-twitter-api');
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
var aux = require('../modules/aux');
var user = {};
var url_handler = aux.trigger;
var authTwitterCallback = url_handler.twitterCallback;

// PASSPORT SERIALIZATION
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

// DEFINING TWITTER STRATEGY

passport.use(new TwitterStrategy({
    consumerKey: 'lAPfDOUThrZtn7MC2jKl3KIP4',
    consumerSecret: 'I32InqgYeyVS3nIBIWNwJdckF56EknAkjZq9pNu9RaJleJzi9d',
    callbackURL: authTwitterCallback
  },
  function(token, tokenSecret, profile, done) {
		user.tokenS=tokenSecret;
		user.token=token;
		user.profile=profile;
		user.id = user.profile._json.screen_name;
		console.log(user.profile._json.profile_image_url);
    done(null, user);
  }
));

var twitter = new twitterAPI({
	consumerKey: 'lAPfDOUThrZtn7MC2jKl3KIP4',
	consumerSecret: 'I32InqgYeyVS3nIBIWNwJdckF56EknAkjZq9pNu9RaJleJzi9d'
});

var twitter_module = {
	passport:passport,
	twitter:twitter,
	user:user
}

module.exports = twitter_module;

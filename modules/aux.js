var mongoUrl = '';
var authTwitterCallback = '';

var switchEnv = function(env){
	if(env==='local'){
		console.log('Local routes added');
		mongoUrl = 'mongodb://localhost/chessTest';
		authTwitterCallback = 'http://tests.sochessJs.com:5000/auth/twitter/callback';
	}else{
		console.log('External routes added');
		mongoUrl = 'mongodb://vctr:190904enriva@ds061601.mongolab.com:61601/heroku_app34055791';
		authTwitterCallback = 'https://sochessJs.herokuapp.com/auth/twitter/callback';
	}
	return {target:env,mongo:mongoUrl,twitterCallback:authTwitterCallback};
};

// SELECTS A SET OF ROUTES BASED ON DE SERVER'S LOCATION
// SET LOCAL FOR LOCAL ENVIRONMENTS OR NOTHING FOR REMOTE ENVIRONMENTS

var trigger = switchEnv('local');

var aux = {
	switchEnv:switchEnv,
	trigger:trigger
}

module.exports = aux;

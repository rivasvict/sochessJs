var mongoUrl = '';
var authTwitterCallback = '';

var aux = {
	switchEnv:function(env){
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
	}
}

module.exports = aux;

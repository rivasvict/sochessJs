var express = require('express');
var router = express.Router();
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

router.get('/',ensureLoggedIn('/auth/twitter'),function(req,res){
	if(req.cookies.user === undefined){
		res.cookie('user',req.user.profile.username);
		res.cookie('token',user.token);
		res.cookie('tokenS',user.tokenS);
	}
	if(req.cookies.user !== undefined)	{
		res.render('index',{id:req.cookies.user});
	}else{
		res.redirect('/auth/twitter');
	}
});

router.post('/validation',function(req,res){
	var roomNameId = generateId();

	var rou = new roo({id:roomNameId, players:[[],[]]});
	rou.save(function(err){
		if(err) console.log(err);	
	});
	roo.find({},function(err,rous){
		if (err) return console.log(err);
		console.log(rous);
	});

	var watchman = entrance(roomNameId);
	if(environment==='local'){
		var sts = req.body.userId+" has challenged you @"+req.body.uChallenge+" go to -> http://tests.sochessJs.com:5000/game/"+roomNameId+"/op/"+req.body.userId+"/user/"+req.body.uChallenge+"/player/2";
	}else{
		var sts = req.body.userId+" has challenged you @"+req.body.uChallenge+" go to -> https://sochessJs.herokuapp.com/game/"+roomNameId+"/op/"+req.body.userId+"/user/"+req.body.uChallenge+"/player/2";
	}
	if(!watchman[0]){
		res.sendStatus(403);
	}else{
		twitter.statuses('update',{
			status:sts
		},'3168152808-7bEM5qVUmCk64h0J8DrP6NlWodVXVmdtSpLC8HR','ju9sfDTph4a3sdlGzEAr8CXjNBAi2NfccFHaIt16DkzgY',function(error,data,response){
			if(error){
				console.log(error);
			}else{
				console.log('succeeded');
			}
		});
		res.redirect('/game/'+roomNameId+'/op/'+req.body.uChallenge+'/user/'+req.body.userId+'/player/'+watchman[1]);
	}
});

router.post('/validateGame',function(req,res){
	var rexist = roomsExist(req.body.idName);
	var watchman = entrance(req.body.idName);
	if(!watchman[0] || !rexist){
		res.sendStatus(403);
	}else{
		res.redirect('/game/'+req.body.idName+'/op/'+req.body.uChallenge+'/user/'+req.body.userId+'/player/'+watchman[1]);
	}
});

module.exports = router;

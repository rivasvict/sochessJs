var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var mongoose = require('mongoose');
var path = require('path');
var aux = require('../modules/aux');
var router = express.Router();
var environment = aux.trigger.target;
var switchEnv = environment.target;
var mongoUrl = environment.mongo;
var authTwitterCallback = environment.twitterCallback;
var twitter_module = require('../modules/twitter');
var passport = twitter_module.passport;

var rExist = aux.rExist;
var g = aux.g;
var un = aux.un;

var roomsExist = aux.roomsExist;
var isConnected = aux.isConnected;
var loginR = aux.loginR;
var rooms = aux.rooms;
var rName = aux.rName;
var roo = mongoose.model('roo',mongoose.testSchema);

// DE FINING A ROUTE WITH PARAMETERS TO BE CATCHED LATER

router.get('/auth/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res,next){
	if(environment === 'local'){
		var clBack = "http://tests.sochessJs.com:5000/callback/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN;
	}else{
		var clBack ="https://sochessJs.herokuapp.com/callback/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN;
	}
	passport.authenticate(
		'twitter',
		{
			callbackURL: clBack
		}
	)(req,res,next);
});

router.get('/callback/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res,next){
	passport.authenticate(
		'twitter',
		function(err,user,info){
			if (err) { return next(err); }
			if (!user) { return res.redirect("/auth/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN); }
			req.logIn(user,function(err){
				if (err) { return next(err); }
				user.id = user.profile._json.screen_name;
				res.cookie('user',user.id);
				res.cookie('token',user.token);
				res.cookie('tokenS',user.tokenS);
				return res.redirect("/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN);
			});
		}
	)(req,res,next);
});


router.get('/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res){
	var roomExistance = roomsExist(req.params.gameId);

	roo.find({},function(err,rous){
	if(req.cookies.user && rExist(req.params.gameId,rous)){
	if(g.complete)
		res.redirect('/');
	if(un===2)
		g.complete = true;
	if(req.params.playerN > 2){
		res.sendStatus(403);
	}else{
		res.render('game');
	}
	io.on('connection', function(socket){
		socket.on('user_connected',function(m){
			if(!isConnected(socket.id)){

				roo.find({id:m.roomId},function(err,rous){
					if(err) console.log(err);

					if(m.player_number === '1'){

						roo.update({id:m.roomId},{players:[[socket.id,req.params.userId],['','']]},function(err){
							if(err) console.log(err);
						});
					}else{
						roo.update({id:m.roomId},{players:[rous[0].players[0],[socket.id,req.params.opponent]]},function(err){
							if(err) console.log(err);
						});
					}


				});
				loginR(socket.id,m.roomId,m.uname);
				socket.join(m.roomId);
			}
			if(m.player_number === '2'){
				io.to(m.roomId).emit('activation'+m.roomId,{room:rooms});
			}
		});
		socket.on('moved'+req.params.gameId,function(m){
			io.to(req.params.gameId).emit('move'+req.params.gameId,m);
		});
		// FOR CHECKMATE
		socket.on('cm'+req.params.gameId,function(m){
			io.to(req.params.gameId).emit('checkMate'+req.params.gameId,m);
		});
		socket.on('disconnect',function(){
				roo.find({},function(err,rous){
					if(err) console.log(err);
					var room_id = rName(socket.id,rous);
					roo.findOneAndRemove({id:room_id},function(err){if(err)console.log(err);});
					
					io.to(room_id).emit('dcnt'+room_id,'dsº');

				});


		});
		socket.on('user_disconnected'+req.params.gameId,function(m){
		});
	});
	}else{
		!roomExistance ? res.sendStatus(404) : res.redirect("/auth/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN);
	}
	});
});

router.post('/disconnection',function(req,res){
	res.redirect('/');
});


/*mongoose.connect(mongoUrl,function(error){
	if(error)
	console.log(error);
});*/


/*router.get('/teist',function(req,res){
	res.sendStatus(200);
});*/

module.exports = router;

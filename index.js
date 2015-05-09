var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var io = require('socket.io')(http);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var twitterAPI = require('node-twitter-api');
var mongoose = require('mongoose');
var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

var user = {};

app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

var mongoUrl = '';
var authTwitterCallback = '';

var switchEnv = function(env){
	if(env==='local'){
		mongoUrl = 'mongodb://localhost/chessTest';
		authTwitterCallback = 'http://tests.sochessJs.com:5000/auth/twitter/callback';
	}else{
		mongoUrl = 'mongodb://vctr:190904enriva@ds061601.mongolab.com:61601/heroku_app34055791';
		authTwitterCallback = 'https://sochessJs.herokuapp.com/auth/twitter/callback';
	}
	return env;
}

app.get('/tst',function(req,res){
	res.render('game');
});

// Set local to use local urls and nothing for remote

var environment = switchEnv('local');

	mongoose.connect(mongoUrl,function(error){
		if(error)
		console.log(error);
	});


app.get('/dbtest',function(req,res, next){
	mongoose.connect(mongoUrl,function(error){
		if(error)
		console.log(error);
	});
	var roo = mongoose.model('roo',{name: String});
	var rou = new roo({name:'asdunodostres'});
	roo.find({name:'asdunodostres'},function(err,rous){
		if (err) return console.log(err);
		console.log(rous);
		res.send(rous);
	});
});

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

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));

app.use(express.static(__dirname + '/public'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

var un = 0;
var g = {
	complete:false
};

var loginR = function(player,room,user){
	for(var i in rooms){
		if(rooms[i].id === room){
			if(rooms[i].players.length <= 1){
				rooms[i].players.push([player,user]);
			}
			return;
		}
	}
}

var roomName = function(query){
	for(var i in rooms){
		for(var j in rooms[i].players){
			if(rooms[i].players[j][0]===query){
				return rooms[i].id;
			}
		}
	}
}

var rName = function(query,roomObject){
	for(var i in roomObject){
		for(var j in roomObject[i].players){
			if(roomObject[i].players[j][0]===query){
				return roomObject[i].id;
			}
		}
	}
}

var isConnected = function(player){
	for(var i in rooms){
		for(var j in rooms[i].players){
			if(rooms[i].players[j][0] === player){
				console.log('already connected');
				return true;
			}
		}
	}
	return false;
}

var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';

var generateId = function(){
	var roomId = '';
	for(var i = 0; i<9;i++){
		roomId += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	for(var i in rooms){
		if(rooms[i].id===roomId)
			generateId();
	}
	return roomId;
}

app.get('/auth/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res,next){
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

app.get('/callback/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res,next){
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

app.get('/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res){
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

app.get('/',ensureLoggedIn('/auth/twitter'),function(req,res){
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

var rooms = [];

var entrance = function(id){
	for(i in rooms){
		if(id === rooms[i].id){
			if(rooms[i].un!==2){
				rooms[i].un = rooms[i].un + 1;
				return [true,rooms[i].un];
			}else{
				return [false];
			}
		}
	}
	rooms.push({id:id,un:1,players:[]});
	return [true,1];
}

var deleteElement = function(query){
	var oldObject = rooms;
	rooms = [];
	for(var i = 0; i < oldObject.lenght ;i++){
		if(oldObject[i].id!==query){
			cosnole.log(oldObject[i]);
			rooms.push(oldObject[i]);
		}
	}
};

var roomsExist = function(rname){
	for(var i in rooms){
		if(rooms[i].id===rname){
			return true;
		}
	}
	return false;
}

var rExist = function(rname,rObject){
	for(var i in rObject){
		if(rObject[i].id===rname){
			return true;
		}
	}
	return false;
}

var testSchema = new mongoose.Schema({id: String, players: Array});

var roo = mongoose.model('roo',testSchema);

app.post('/validation',function(req,res){
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

app.post('/validateGame',function(req,res){
	var rexist = roomsExist(req.body.idName);
	var watchman = entrance(req.body.idName);
	if(!watchman[0] || !rexist){
		res.sendStatus(403);
	}else{
		res.redirect('/game/'+req.body.idName+'/op/'+req.body.uChallenge+'/user/'+req.body.userId+'/player/'+watchman[1]);
	}
});

app.post('/disconnection',function(req,res){
	res.redirect('/');
});

http.listen(process.env.PORT || 5000);

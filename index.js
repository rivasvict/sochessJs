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
//var db = mongoose.connection;
	//mongoose.connect('mongodb://localhost/chessTest',function(error){
	mongoose.connect('mongodb://vctr:190904enriva@ds061601.mongolab.com:61601/heroku_app34055791',function(error){
		if(error)
		console.log(error);
	});


/*var testSchema = mongoose.Schema({
	name:String,
	age:String
});*/

//var test1 = mongoose.model('test1',testSchema);
//mongoose.model('test1',{name:String,age:String});

app.get('/dbtest',function(req,res, next){
	mongoose.connect('mongodb://localhost/test',function(error){
	//mongoose.connect('mongodb://vctr:190904enriva@ds061601.mongolab.com:61601/heroku_app34055791',function(error){
		if(error)
		console.log(error);
	});
	var roo = mongoose.model('roo',{name: String});
	var rou = new roo({name:'asdunodostres'});
	/*rou.save(function(err){
		if(err) console.log(err);	
	});*/
	/*roo.remove({name:'asdunodostres'},function(err){
		if(err) console.log(err);
	});*/
	roo.find({name:'asdunodostres'},function(err,rous){
		if (err) return console.log(err);
		console.log(rous);
		res.send(rous);
	});
	//res.sendStatus(200);
/*	mongoose.model('test1').find(function(err,user){
		res.send(user);
	});*/

});

var user = {};

var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;
app.use(session({ secret: 'SECRET' }));
app.use(passport.initialize());
app.use(passport.session());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: '5WcVdkvcBv0FNjzelpsObRlEn',
    consumerSecret: 'WsHHqEB5NstRy9125d7KjCUG2OJtLwox1c8wEoVlCFXEoQr367',
    //callbackURL: "http://sochessJs.herokuapp.com/"
    callbackURL: "https://sochessJs.herokuapp.com/auth/twitter/callback"
    //callbackURL: "http://tests.sochessJs.com:5000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
		user.tokenS=tokenSecret;
		user.token=token;
		user.profile=profile;
		user.id = user.profile._json.screen_name;
		console.log(user.profile._json.profile_image_url);
    done(null, user);
    /*User.findOrCreate('', function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });*/
  }
));

var twitter = new twitterAPI({
	consumerKey: '5WcVdkvcBv0FNjzelpsObRlEn',
	consumerSecret: 'WsHHqEB5NstRy9125d7KjCUG2OJtLwox1c8wEoVlCFXEoQr367'/*,
	callback: 'http://tests.sochessJs.com:5000/auth/twitter/callback'*/
});

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/',
                                     failureRedirect: '/login' }));
//var redirect = require('express-redirect');


//redirect(app);
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
			//console.log('room id: '+room);
			//console.log(rooms[i].id + ' = ' + room);
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

app.get('/user/:user',function(req,res){
	
});

app.get('/auth/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res,next){
	passport.authenticate(
		'twitter',
		{
			callbackURL: "https://sochessJs.herokuapp.com/callback/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN
			//callbackURL: "http://tests.sochessJs.com:5000/callback/game/"+req.params.gameId+"/op/"+req.params.opponent+"/user/"+req.params.userId+"/player/"+req.params.playerN
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
	/*{
			successRedirect: "/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN,
			failureRedirect: "/auth/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN
		}*/
	)(req,res,next);
});

app.get('/game/:gameId/op/:opponent/user/:userId/player/:playerN',function(req,res){
	var roomExistance = roomsExist(req.params.gameId);
	//console.log(roomExistance.players);

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
				/* CONNECT TO DATABASE AND SHOW THE ID IN CONSOLE */
				/*mongoose.connect('mongodb://localhost/chessTest',function(error){
					if(error) console.log(error);
				});*/

				roo.find({id:m.roomId},function(err,rous){
					if(err) console.log(err);

					//adding details to the room
					if(m.player_number === '1'){

						roo.update({id:m.roomId},{players:[[socket.id,req.params.userId],['','']]},function(err){
							if(err) console.log(err);
						});
					}else{
						//console.log('showing rous');
						//console.log(rous);
						roo.update({id:m.roomId},{players:[/*[socket.id,req.params.userId]*/rous[0].players[0],[socket.id,req.params.opponent]]},function(err){
							if(err) console.log(err);
						});
					}


				});
				//if (req.params.playerN === '2') mongoose.disconnect();
				loginR(socket.id,m.roomId,m.uname);
				socket.join(m.roomId);
			}
			if(m.player_number === '2'){
				io.to(m.roomId).emit('activation'+m.roomId,{room:rooms});
			}
			//io.to(req.params.gameId).emit('sendo'+req.params.gameId,rooms);
		});
		socket.on('moved'+req.params.gameId,function(m){
			io.to(req.params.gameId).emit('move'+req.params.gameId,m);
		});
		// FOR CHECKMATE
		socket.on('cm'+req.params.gameId,function(m){
			io.to(req.params.gameId).emit('checkMate'+req.params.gameId,m);
		});
		socket.on('disconnect',function(){
			//room_id = roomName(socket.id);

//			deleteElement(room_id);

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
	//res.sendFile(__dirname+'/index.html');
	if(req.cookies.user === undefined){
	//console.log(user.token)
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

app.get('/root',function(req,res){
	res.render('index');
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
	//res.redirect('/game/:gameId');
/*	mongoose.connect('mongodb://localhost/chessTest',function(error){
		if(error)
		console.log(error);
	});*/

	var rou = new roo({id:roomNameId, players:[[],[]]});
	rou.save(function(err){
		if(err) console.log(err);	
	});
	/*roo.remove({name:'asdunodostres'},function(err){
		if(err) console.log(err);
	});*/
	roo.find({},function(err,rous){
		if (err) return console.log(err);
		console.log(rous);
		//res.send(rous);
	});

	//res.sendStatus(200);
/*	mongoose.model('test1').find(function(err,user){
		res.send(user);
	});*/


	var watchman = entrance(roomNameId);
	if(!watchman[0]){
		res.sendStatus(403);
	}else{
		twitter.statuses('update',{
			status:"I have challenged you @"+req.body.uChallenge+" https://sochessJs.herokuapp.com/game/"+roomNameId+"/op/"+req.body.userId+"/user/"+req.body.uChallenge+"/player/2"
			//status:"I have challenged you @"+req.body.uChallenge+" http://tests.sochessJs.com:5000/game/"+roomNameId+"/op/"+req.body.userId+"/user/"+req.body.uChallenge+"/player/2"
		},req.cookies.token,req.cookies.tokenS,function(error,data,response){
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

/*http.listen(3000, function(){
	console.log('listening on 3000');
});*/

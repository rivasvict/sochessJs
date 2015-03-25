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
    callbackURL: "http://sochessJs.herokuapp.com/auth/twitter/callback"
    //callbackURL: "http://tests.sochessJs.com:5000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
		user.tokenS=tokenSecret;
		user.token=token;
		user.profile=profile;
		user.id = user.profile._json.screen_name;
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

app.get('/auth/game/:gameId/user/:userId/player/:playerN',function(req,res,next){
	passport.authenticate(
		'twitter',
		{
			callbackURL: "http://sochessJs.herokuapp.com/callback/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN
			//callbackURL: "http://tests.sochessJs.com:5000/callback/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN
		}
	)(req,res,next);
});

app.get('/callback/game/:gameId/user/:userId/player/:playerN',function(req,res,next){
	passport.authenticate(
		'twitter',
		function(err,user,info){
			if (err) { return next(err); }
			if (!user) { return res.redirect("/auth/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN); }
			req.logIn(user,function(err){
				if (err) { return next(err); }
				user.id = user.profile._json.screen_name;
				res.cookie('user',user.id);
				res.cookie('token',user.token);
				res.cookie('tokenS',user.tokenS);
				return res.redirect("/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN);
			});
		}
	/*{
			successRedirect: "/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN,
			failureRedirect: "/auth/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN
		}*/
	)(req,res,next);
});

app.get('/game/:gameId/user/:userId/player/:playerN',function(req,res){
	var roomExistance = roomsExist(req.params.gameId);
	
	if(req.cookies.user && roomExistance){
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
				loginR(socket.id,m.roomId,m.uname);
				socket.join(m.roomId);
			}
			if(m.player_number === '2'){
				io.to(m.roomId).emit('activation'+m.roomId,{});
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
			room_id = roomName(socket.id);
			deleteElement(room_id);
			io.to(room_id).emit('dcnt'+room_id,'dsº');
		});
		socket.on('user_disconnected'+req.params.gameId,function(m){
		});
	});
	}else{
		res.redirect("/auth/game/"+req.params.gameId+"/user/"+req.params.userId+"/player/"+req.params.playerN);
	}
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

app.post('/validation',function(req,res){
	//res.redirect('/game/:gameId');

	var roomNameId = generateId();
	var watchman = entrance(roomNameId);
	if(!watchman[0]){
		res.sendStatus(403);
	}else{
		twitter.statuses('update',{
			status:"I have challenged you @"+req.body.uChallenge+" http://sochessJs.herokuapp.com/game/"+roomNameId+"/user/"+req.body.uChallenge+"/player/2"
			//status:"I have challenged you @"+req.body.uChallenge+" http://tests.sochessJs.com:5000/game/"+roomNameId+"/user/"+req.body.uChallenge+"/player/2"
		},req.cookies.token,req.cookies.tokenS,function(error,data,response){
			if(error){
				console.log(error);
			}else{
				console.log('succeeded');
			}
		});

		res.redirect('/game/'+roomNameId+'/user/'+req.body.userId+'/player/'+watchman[1]);
	}

	
});

app.post('/validateGame',function(req,res){
	var rexist = roomsExist(req.body.idName);
	var watchman = entrance(req.body.idName);
	if(!watchman[0] || !rexist){
		res.sendStatus(403);
	}else{
		res.redirect('/game/'+req.body.idName+'/user/'+req.body.userId+'/player/'+watchman[1]);
	}
});

app.post('/disconnection',function(req,res){
	res.redirect('/');
});

http.listen(process.env.PORT || 5000);

/*http.listen(3000, function(){
	console.log('listening on 3000');
});*/

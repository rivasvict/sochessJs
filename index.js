var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var io = require('socket.io')(http);
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
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

app.get('/game/:gameId/user/:userId/player/:playerN',function(req,res){
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

});

app.get('/',function(req,res){
	//res.sendFile(__dirname+'/index.html');
	res.render('index',{id:'my id 33333'});
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

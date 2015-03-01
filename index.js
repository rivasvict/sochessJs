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


app.get('/game/:gameId/player/:playerN',function(req,res){
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
		//console.log(rooms);
		socket.join(req.params.gameId);
		socket.on('moved'+req.params.gameId,function(m){
			io.to(req.params.gameId).emit('move'+req.params.gameId,m);
		});
		// FOR CHECKMATE
		socket.on('cm'+req.params.gameId,function(m){
			io.to(req.params.gameId).emit('checkMate'+req.params.gameId,m);
		});
		socket.on('disconnect',function(){
			//console.log(rooms);
			//console.log(rooms);
			console.log(socket.id);
			io.to(req.params.gameId).emit('dcnt'+req.params.gameId,'I left');
		});
		socket.on('user_disconnected'+req.params.gameId,function(m){
			socket.leave(req.params.gameId);
			deleteElement(req.params.gameId);
			//console.log('Disconecting from: '+req.params.gameId);
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
	rooms.push({id:id,un:1});
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

app.post('/validation',function(req,res){
	//res.redirect('/game/:gameId');

	var watchman = entrance(req.body.idName);

	if(!watchman[0]){
		res.sendStatus(403);
	}else{
		res.redirect('/game/'+req.body.idName+'/player/'+watchman[1]);
	}

	
});

app.post('/disconnection',function(req,res){
	res.redirect('/');
});

http.listen(process.env.PORT || 5000);

/*http.listen(3000, function(){
	console.log('listening on 3000');
});*/

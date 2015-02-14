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
	console.log(g.complete);
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
		socket.on('moved',function(m){
			io.emit('move',m);
		});
	});
	//console.log(req.status);

});

app.get('/',function(req,res){
	//res.sendFile(__dirname+'/index.html');
	res.render('index',{id:'my id 33333'});
});

app.post('/validation',function(req,res){
	//res.redirect('/game/:gameId');
	un = un + 1;
	if(un>2){
		res.sendStatus(403);
	}else{
		res.redirect('/game/'+req.body.idName+'/player/'+un);
	}
});

http.listen(3000, function(){
	console.log('listening on 3000');
});

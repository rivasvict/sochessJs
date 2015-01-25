var app = require('express')();
var http = require('http').Server(app);
var express = require('express');
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

io.on('connection', function(socket){
	socket.on('moved',function(m){
		io.emit('move',m);
	});
});

http.listen(3000, function(){
});

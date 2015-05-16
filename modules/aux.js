var mongoUrl = '';
var authTwitterCallback = '';
var mongoose = require('mongoose');

// SET LOCAL FOR LOCAL ENVIRONMENTS OR NOTHING FOR REMOTE ENVIRONMENTS
var lead =	'';

var switchEnv = function(env){
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
};

switchEnv(lead);

// DATABASE SHEMA

//var testSchema = new mongoose.Schema({id: String, players: Array});
//var roo = mongoose.model('roo',testSchema);

// SELECTS A SET OF ROUTES BASED ON DE SERVER'S LOCATION

var trigger = switchEnv(lead);

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

var aux = {
	switchEnv:switchEnv,
	trigger:trigger,
	un:un,
	g:g,
	loginR:loginR,
	roomName:roomName,
	rName:rName,
	isConnected:isConnected,
	chars:chars,
	rooms:rooms,
	entrance:entrance,
	deleteElement:deleteElement,
	roomsExist:roomsExist,
	rExist:rExist,
	generateId:generateId
}

module.exports = aux;

window.onload = function(){
var idGame = window.location.pathname.substring(window.location.pathname.indexOf('/game/')+6,window.location.pathname.indexOf('/op/'));
var nplayer = window.location.pathname[window.location.pathname.length - 1];
var username = window.location.pathname.substring(window.location.pathname.indexOf('/user/')+6,window.location.pathname.indexOf('/player/'));
var opponent = window.location.pathname.substring(window.location.pathname.indexOf('/op/')+4,window.location.pathname.indexOf('/user/'));
var player = window.location.pathname[window.location.pathname.length-1];

var board,
  game = new Chess(),
	boardEl = $('#board'),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

var removeHighlights = function(color) {
  boardEl.find('.square-55d63')
    .removeClass('highlight-' + color);
};

var removeGreySquares = function() {
  $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
  var squareEl = $('#board .square-' + square);
  
  var background = '#a9a9a9';
  if (squareEl.hasClass('black-3c85d') === true) {
    background = '#696969';
  }

  squareEl.css('background', background);
};

var dragged = false;
var started = false;

var onDragStart = function(source, piece, position, orientation) {
	if(!started){
		alert('We are waiting by your opponent to connect, please');
	}
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
			!started) {
    	return false;
		}
		if((game.turn() === 'b' && (piece.search(/^w/) !== -1 || piece.search(/^b/) !== -1) && nplayer === '1') ||
			(game.turn() === 'w' && (piece.search(/^w/) !== -1 || piece.search(/^b/) !== -1) && nplayer === '2')){
			return false;
		}
	dragged = true;
};

var winner = null;

var returnWinner = function(turn){
	if(turn === 'w'){
		return 'b';
	}else{
		return 'w';
	}
}

var winner = null;

var points = {
	w:0,
	b:0
};

var piecesPoints = {
	q:6,
	Q:6,
	p:1,
	P:1,
	r:3,
	R:3
};

var punctuation = function(piece,target){
	points[target] = points[target] + piecesPoints[piece];
	if(nplayer==='1'){
		$('#localPoints').text(points.w);
		$('#foreingPoints').text(points.b);
	}else{
		$('#localPoints').text(points.b);
		$('#foreingPoints').text(points.w);
	}
};

var onDrop = function(source, target) {


	socket.on('checkMate'+idGame,function(m){
		winner = m;
	});

	removeGreySquares();
	var move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

	if (move === null) return 'snapback';

	if(game.in_checkmate()){
		if(winner === null){
			alert('you won');
		}else{
			alert('you lost');
		}
		socket.emit('cm'+idGame,returnWinner(game.turn));
	}

	if(game.in_check()){
		if(!game.in_checkmate()){
			alert('check');
		}
	};

	if(game.in_draw()){
		alert('Draw');
	}

	if(game.turn()==='b' && nplayer === '2'){
		startLClock();
		clearInterval(foreingTrigger);
		removeHighlights('black');
		boardEl.find('.square-' + source).addClass('highlight-black');
		boardEl.find('.square-' + target).addClass('highlight-black');
	}
	if(game.turn()==='w' && nplayer === '1'){
		startLClock();
		clearInterval(foreingTrigger);
		removeHighlights('white');
		boardEl.find('.square-' + source).addClass('highlight-white');
		boardEl.find('.square-' + target).addClass('highlight-white');
	}

	if(game.turn()==='b' && nplayer === '1'){
		startFClock();
		clearInterval(localTrigger);
	}
	if(game.turn()==='w' && nplayer === '2'){
		startFClock();
		clearInterval(localTrigger);
	}


	if(game.turn()==='w'){
		if(boardEl.find('.square-'+target).hasClass('highlight-black')){
			removeHighlights('black');
		}
	}else{
		if(boardEl.find('.square-'+target).hasClass('highlight-white')){
			removeHighlights('white');
		}
	}
	if(game.history({verbose:true})[game.history({verbose:true}).length -1].captured !== undefined){
		var movement = game.history({verbose:true})[game.history({verbose:true}).length -1];
		punctuation(movement.captured,movement.color);
	}
  updateStatus();
};

var onMouseoverSquare = function(square, piece) {

	var moves = game.moves({
    square: square,
    verbose: true
  });

	if (moves.length === 0) return;

	greySquare(square);

	for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

var onMouseoutSquare = function(square, piece) {
  removeGreySquares();
};

var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
	
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

 if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  else {
    status = moveColor + ' to move';


   if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  statusEl.html(status);
  fenEl.html(game.fen());
  pgnEl.html(game.pgn());
};

var onMoveEnd = function(){
};


socket.emit('user_connected',{roomId:idGame,uname:username,player_number:nplayer});

var movedByUser = function(){
	socket.emit('moved'+idGame,game.history({verbose:true}));
	dragged = false;
}

var onChange = function(){
	if(dragged){
		movedByUser();
	}
};

var showUsernames = function(){
	$('#localUser').text(username);
	$('#foreingUser').text(opponent);
	$('#localAvatar').html('<img src="http://avatars.io/twitter/'+username+'">');
	$('#foreingAvatar').html('<img src="http://avatars.io/twitter/'+opponent+'">');
};

socket.on('activation'+idGame,function(m){
	$.get('http://avatars.io/twitter/'+username,function(data){
		console.log(data);
	});
	showUsernames();
	started = true;
	$('#waiting-opponent').hide()
	$('#board').show();
	if(ort === 'white'){
		startLClock();
	}else{
		startFClock();
	}
});

socket.on('sendo'+idGame,function(m){
	console.log(m);
});

console.log(idGame);

socket.on('move'+idGame,function(m){
	//      THIS IS A VIRTUAL MOVE THAT EMULATES USER A MOVE WITH onDrop() and onSnapEnd()
	onDrop(m[m.length - 1].from,m[m.length - 1].to);
	board.move(m[m.length - 1].from + '-' +m[m.length - 1].to);
	onSnapEnd();
});

socket.on('dcnt'+idGame,function(m){
	alert('You won, your opponent has left');
	//socket.emit('user_disconnected'+idGame);
	//socket.emit('disconnect'+idGame);
});



var ort = 'white';

if(parseInt(player) === 2){
	ort = 'black';
}
var cfg = {
	position:{
		a1:'wR',
		b1:'wQ',
		c1:'wK',
		d1:'wR',
		a2:'wP',
		b2:'wP',
		c2:'wP',
		d2:'wP',
		a6:'bR',
		b6:'bQ',
		c6:'bK',
		d6:'bR',
		a5:'bP',
		b5:'bP',
		c5:'bP',
		d5:'bP'
	},
	dropOffBoard:'snapback',
	draggable:true,
	onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  onMoveEnd: onMoveEnd,
	onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
	onChange: onChange,
	orientation:ort
}
var board = new ChessBoard('board',cfg);
$('#board').hide();
if(!started){
	$('#waiting-opponent').html('Waiting for your opponent to connect');
}

var localMins = 60;
var foreingMins = 60;
var localStarted = false;
var foreingStarted = false;
var lMseconds = 1000;
var fMseconds = 1000;

var currentLocal,localTrigger,currentForeing, foreingTrigger;

function startLTimer(duration, display, miliSeconds) {
	var timer = duration, minutes, seconds;
	localTrigger = setInterval(function () {
		minutes = parseInt(timer / 60, 10);
		seconds = parseInt(timer % 60, 10);

		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;

		if(miliSeconds >= 250){
			miliSeconds = miliSeconds - 250;
		}else{
			if (--timer < 0) {
				timer = duration;
			}
			miliSeconds = miliSeconds + 1000;
		}
		display.text(minutes + ":" + seconds);
		localMins = (parseInt(minutes) * 60) + parseInt(seconds);
		lMseconds = miliSeconds;
		if(localMins === 0){
			alert('Time is up! You lost!');
			clearInterval(foreingTrigger);
			clearInterval(localTrigger);
		}
		localStarted = true;

	}, 250);
}


//jQuery(function ($) {
var startLClock = function(){
	var display = $('#localTimer');
	if(!localTrigger || localStarted){
		startLTimer(localMins, display, lMseconds);
	}
};
//});



function startFTimer(duration, display, miliSeconds) {
	var timer = duration, minutes, seconds;
	foreingTrigger = setInterval(function () {
		minutes = parseInt(timer / 60, 10);
		seconds = parseInt(timer % 60, 10);

		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;

		display.text(minutes + ":" + seconds);
		if(miliSeconds >= 250){
			miliSeconds = miliSeconds - 250;
		}else{
			if (--timer < 0) {
				timer = duration;
			}
			miliSeconds = miliSeconds + 1000;
		}

		foreingMins = (parseInt(minutes) * 60) + parseInt(seconds);
		fMseconds = miliSeconds;

		if(foreingMins === 0){
			alert('Your opponent ran out of time! You won!');
			clearInterval(foreingTrigger);
			clearInterval(localTrigger);
		}
		foreingStarted = true;
	}, 250);
}

var localMins = 60;

//jQuery(function ($) {
var startFClock = function(){
	var display = $('#foreingTimer');
	if(!foreingTrigger || foreingStarted){
		startFTimer(foreingMins, display, fMseconds);
	}
};
//});
}

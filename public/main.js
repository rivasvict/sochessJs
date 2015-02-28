var board,
  game = new Chess(),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

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

var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
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

var onMoveEnd = function(){};

var idGame = window.location.pathname.substring(6,window.location.pathname.indexOf('/player/'));
var nplayer = window.location.pathname[window.location.pathname.length - 1];

var movedByUser = function(){
	socket.emit('moved'+idGame,game.history({verbose:true}));
	dragged = false;
}

var onChange = function(){
	if(dragged){
		movedByUser();
	}
};

socket.on('move'+idGame,function(m){
	//      THIS IS A VIRTUAL MOVE THAT EMULATES USER A MOVE WITH onDrop() and onSnapEnd()
	onDrop(m[m.length - 1].from,m[m.length - 1].to);
	board.move(m[m.length - 1].from + '-' +m[m.length - 1].to);
	onSnapEnd();
});

var player = window.location.pathname[window.location.pathname.length-1];

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

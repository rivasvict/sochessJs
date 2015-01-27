var board,
  game = new Chess(),
  statusEl = $('#status'),
  fenEl = $('#fen'),
  pgnEl = $('#pgn');

var dragged = false;

var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
	dragged = true;
};

var onDrop = function(source, target) {
	var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

	if (move === null) return 'snapback';

  	updateStatus();
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

var movedByUser = function(){
	socket.emit('moved',game.history({verbose:true}));
	dragged = false;
}

var onChange = function(){
	if(dragged){
		movedByUser();
	}
};

socket.on('move',function(m){
	board.move(m[m.length - 1].from + '-' +m[m.length - 1].to);
});

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
	onChange: onChange
}
var board = new ChessBoard('board',cfg);

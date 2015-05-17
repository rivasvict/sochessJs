window.onload = function(){
				// GAME VARIABLES
				var dragged = false;
				var started = false;

				// BOARD VARIABLES AND INITIALIZATION OF CHESS LIBRARY
				var board,
					game 			= new Chess(),
					boardEl 	= $('#board'),
					statusEl 	= $('#status'),
					fenEl 		= $('#fen'),
					pgnEl 		= $('#pgn');

				var onDragStart = function(source, piece, position, orientation) {
					if(!started){
						alert('We are waiting by your opponent to connect');
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
							//alert('you won');
							ribbonTrigger.checkWon();
						}else{
							//alert('you lost');
							ribbonTrigger.checkLost();
						}
						socket.emit('cm'+idGame,returnWinner(game.turn));
					}

				//Reset check ribbons
					$('#localCheck').hide();
					$('#foreingCheck').hide();

					if(game.in_check()){
						if(!game.in_checkmate()){
							if(game.turn()==='b' && nplayer === '2'){
							//alert('check');
								$('#localCheck').show();
							}
							if(game.turn()==='w' && nplayer === '1'){
								$('#localCheck').show();
							}
							if(game.turn()==='b' && nplayer === '1'){
								$('#foreingCheck').show();
							}
							if(game.turn()==='w' && nplayer === '2'){
								$('#foreingCheck').show();
							}
						}
					};

					if(game.in_draw()){
						//alert('Draw');
						ribbonTrigger.draw();
					}

					if(game.turn()==='b' && nplayer === '2'){
						$('#localTurn').show();
						$('#foreingTurn').hide();
						startLClock();
						clearInterval(foreingTrigger);
						removeHighlights('black');
						boardEl.find('.square-' + source).addClass('highlight-black');
						boardEl.find('.square-' + target).addClass('highlight-black');
					}
					if(game.turn()==='w' && nplayer === '1'){
						startLClock();
						$('#localTurn').show();
						$('#foreingTurn').hide();
						clearInterval(foreingTrigger);
						removeHighlights('white');
						boardEl.find('.square-' + source).addClass('highlight-white');
						boardEl.find('.square-' + target).addClass('highlight-white');
					}

					if(game.turn()==='b' && nplayer === '1'){
						startFClock();
						$('#localTurn').hide();
						$('#foreingTurn').show();
						clearInterval(localTrigger);
					}
					if(game.turn()==='w' && nplayer === '2'){
						$('#localTurn').hide();
						$('#foreingTurn').show();
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

				socket.on('move'+idGame,function(m){
					//      THIS IS A VIRTUAL MOVE THAT EMULATES USER A MOVE WITH onDrop() and onSnapEnd()
					onDrop(m[m.length - 1].from,m[m.length - 1].to);
					board.move(m[m.length - 1].from + '-' +m[m.length - 1].to);
					onSnapEnd();
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
					$('#waiting-opponent').html('<div id="waiting-text">Waiting for your opponent to connect</div><div><img src="/img/loading.gif" class="loading"/></div>');
				}
}

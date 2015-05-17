var winner = null;

var returnWinner = function(turn){
	if(turn === 'w'){
		return 'b';
	}else{
		return 'w';
	}
}

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
		$('#localPoints').text(points.w + ' points');
		$('#foreingPoints').text(points.b + ' points');
	}else{
		$('#localPoints').text(points.b + ' points');
		$('#foreingPoints').text(points.w + ' points');
	}
};

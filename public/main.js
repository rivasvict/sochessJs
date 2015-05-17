window.onload = function(){
// MOST MAIN DOM MANIPUATION

// STYLING FUNCTIONS
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

var returnWinner = function(turn){
	if(turn === 'w'){
		return 'b';
	}else{
		return 'w';
	}
}

var showRibbon = function(){
	$('.mainRibbon').show();
	$('.blockerDiv').show();
}

var ribbonTrigger = {
	foreingTimesUp : function(){
			$('#opponentNoTime').show();
			showRibbon();
		},
	localTimesUp : function(){
			$('#youNoTime').show();
			showRibbon();
		},
	checkWon : function(){
			$('#checkRibbonWon').show();
			stopWatch();
			showRibbon();
		},
	checkLost : function(){
			$('#checkRibbonLost').show();
			stopWatch();
			showRibbon();
		},
	draw : function(){
			$('#drawRibbon').show();
			stopWatch();
			showRibbon();
		},
	disconnected : function(){
			$('#disconnectedRibbon').show();
			stopWatch();
			showRibbon();
		},
}

var showUsernames = function(){
	$('#localUser').text(username);
	$('#foreingUser').text(opponent);
	$('#localAvatar').html('<img src="http://avatars.io/twitter/'+username+'">');
	$('#foreingAvatar').html('<img src="http://avatars.io/twitter/'+opponent+'">');
	$('#localTimer').show();
	$('#foreingTimer').show();
	$('#localPoints').show();
	$('#foreingPoints').show();
	$('#yield-div').show();
};

socket.on('activation'+idGame,function(m){
	$.get('http://avatars.io/twitter/'+username,function(data){
		//console.log(data);
	});
	showUsernames();
	started = true;
	$('#waiting-opponent').hide()
	$('#board').show();
	if(ort === 'white'){
		$('#localTurn').show();
		startLClock();
	}else{
		$('#foreingTurn').show();
		startFClock();
	}
});

// STYLES THAT DEPEND ON HEIGHT MEASUREMENT

$($($('#board')[0]).children()).children().removeAttr('style');
$($($('#board')[0]).children()).children().css('border','none');
$('#board').width('100%');
$('.mainRibbon').css('top',dHeight * .35);
if(dHeight<591){
	$('#whiteBack').css('top',0);
	$('#contentGame').css('margin-top',10);
		if(dHeight<549){
			$('.contact').css('position','relative');
			$('.contact').css('margin-top',600);
		}
}else{
	$('#whiteBack').css('top',dHeight * .06);
	if(dHeight>549)
		$('.contact').css('position','fixed');
	//$('#contentGame').css('margin-top',dHeight * .07);
}

var dWidth = $(window).width();
var whiteW = $('#whiteBack').width();

$('.gameElements').css('margin-left',(whiteW - 197)/2);
if(dWidth<580){
	//$('#board').css('width',dWidth * 0.1);
	$('.gameElements').css('margin-left',(whiteW - 197)/2);
//	$('#board').css('margin-left',(dWidth - -400)/2);
}

$(window).resize(function(){
	dHeight = $(window).height();
	dWidth = $(window).width();
	whiteW = $('#whiteBack').width();
	if(dHeight<591){
		$('#whiteBack').css('top',0);
		$('#contentGame').css('margin-top',10);
		if(dHeight<549){
			$('.contact').css('position','initial!important');
			$('.contact').css('margin-top',600);
		}
	}else{
		if(dHeight>549)
			$('.contact').css('position','fixed');
		$('#whiteBack').css('top',dHeight * .06);
	}
	if(dWidth<580){
		$('.gameElements').css('margin-left',(whiteW - 197)/2);
	}else{
		$('.gameElements').css('margin-left',(whiteW - 197)/2);
		$('#board').css('width','initial');
		$('#board').css('margin-left','initial');
	}
});
}

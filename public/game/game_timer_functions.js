
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
		display.text('Timer: '+minutes + ":" + seconds);
		localMins = (parseInt(minutes) * 60) + parseInt(seconds);
		lMseconds = miliSeconds;
		if(localMins === 0){
			//alert('Time is up! You lost!');
			ribbonTrigger.localTimesUp();
			clearInterval(foreingTrigger);
			clearInterval(localTrigger);
		}
		localStarted = true;

	}, 250);
}

var stopWatch = function() {
	clearInterval(foreingTrigger);
	clearInterval(localTrigger);
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

		display.text('Timer: ' + minutes + ":" + seconds);
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
			//alert('Your opponent ran out of time! You won!');
			ribbonTrigger.foreingTimesUp();
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

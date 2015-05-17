// URL VARIABLES
var idGame = window.location.pathname.substring(window.location.pathname.indexOf('/game/')+6,window.location.pathname.indexOf('/op/'));
var nplayer = window.location.pathname[window.location.pathname.length - 1];
var username = window.location.pathname.substring(window.location.pathname.indexOf('/user/')+6,window.location.pathname.indexOf('/player/'));
var opponent = window.location.pathname.substring(window.location.pathname.indexOf('/op/')+4,window.location.pathname.indexOf('/user/'));
var player = window.location.pathname[window.location.pathname.length-1];

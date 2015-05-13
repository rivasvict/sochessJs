var mongoose = require('mongoose');
var aux = require('../modules/aux');

var mongoUrl = aux.trigger;

mongoose.connect(mongoUrl,function(error){
	if(error)
	console.log(error);
});

module.exports = mongoose;

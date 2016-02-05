
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TocSchema = new Schema ({
	table: Array
})


module.exports = mongoose.model('Toc', TocSchema);
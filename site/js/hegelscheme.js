
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ParagraphSchema = new Schema({
	text: Array,
    id: String,
    type: String 
})
var HegelSchema = new Schema({  //Change name to section schema
	number: Number,
	hegel: ParagraphSchema,
	findlay: ParagraphSchema
});


module.exports = mongoose.model('Hegel', HegelSchema);



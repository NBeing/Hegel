
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SectionSchema = new Schema({
	text: String,
    id: String,
    type: String 
})
var HegelSchema = new Schema({
	hegel: {SectionSchema},
	findlay: {SectionSchema}
});


module.exports = mongoose.model('Hegel', HegelSchema);


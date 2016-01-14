
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HegelSchema = new Schema({
    text: String,
    id: String,
    type: String
});
module.exports = mongoose.model('Hegel', HegelSchema);


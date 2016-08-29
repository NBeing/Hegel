module.exports = {};
var _ = require('underscore');
var paragraphProto = {

    getType: function getType(){
        return this.type;
    },
    setType: function setType(type){
        this.type = type;
    },
    getText: function getText(){
        return this.text;
    },
    setText: function setText(paragraphs){
        this.text = [];
        if(typeof(paragraphs) == 'string'){
            this.text.push(paragraphs);
        }
        if(Array.isArray(paragraphs)){
            var newText = [];
            paragraphs.forEach(function(para){
                newText.push(para)
            });
            this.text = newText;
        }
    },
    addPara: function addPara(paragraph){
        this.text.push(paragraph);
    },
    getId: function getId(){
        return this.id;
    },
    setId: function setId(id){
        this.id = id;
    }
}

module.exports.paragraphProto = paragraphProto;


var makeEng = function (id) {
    var paraEng = _.extend({} , paragraphProto, {type: 'english'});
    if(id){
        paraEng.setId(id);    
    }
    return paraEng;
}
module.exports.makeEng = makeEng;
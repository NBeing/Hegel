var exports = module.exports = {}
var Promise = require('promise');
var natural = require('natural');
var wordnet = new natural.WordNet();
var tokenizer = new natural.WordTokenizer();

var getToken =  function(word ){
    return new Promise(function(fulfill, reject){
        wordnet.lookup(word, function(result){
            try {
                var res = {"word": word , info : []}
                res.info = result;
                fulfill(res);
            } catch (ex){
                reject(ex);
            }
        }, reject);
    });
}
exports.getToken = getToken;

var look = function(word){
    return new Promise(function(fulfill, reject){
        try{
            var lookup = getToken(word);
            fulfill(lookup);
        } catch (ex){
            reject(ex);
        }
    })
}
exports.look = look;

var lookupmultiple = function(words){
      var promises = [];
      words.forEach(function(word){

      promises.push(look(word));
      })
    return Promise.all(promises);
}

exports.lookupmultiple = lookupmultiple;
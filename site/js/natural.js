var exports = module.exports = {}

exports.getToken =  function(word ){
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

exports.objectify  = function(wordlist){
    return new Promise (function (fulfill, reject){
        try{
            var info = wordlist.info;
            info.forEach(function(res){
                var obj = {};
                obj.lemma = res.lemma;
                obj.gloss = res.gloss;
                obj.def = res.def;
                wordlist.info.push(obj);
            });
            console.log(wordlist.info);
            fulfill(wordlist.info);
        } catch (ex){
            reject(ex)
        }
    })
}

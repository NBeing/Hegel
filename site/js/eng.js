module.exports = {};

var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');
var mongoose = require('mongoose');

var Hegel = require('./hegelscheme.js');
var Para = require('./objs.js');

var getit = function(url){
    return new Promise(function(fulfill, reject){
        try{
            request(url, function(error, response,body){
                if (!error && response.statusCode == 200) {
                    fulfill(body);
                }
            })
        } catch (ex){
            reject (ex);
        }
    });
};
module.exports.getit = getit;

var get_data = function(cheer){
    return new Promise(function(fulfill, reject){
        try{
            var $ = cheerio.load(cheer);
            var p  = $('p');
            var english_array = [];
            
            p.each(function(){
                var p  = $(this);
                //make English
                var eng = Para.makeEng();

                if (p.find('span.point1').text()){

                    var text = p.find('span.point1');
                    var id = text.find('a').next().text();
                    eng.setId(id);
            
                    var first_text = p.find('span.point1').parent().text();
                    text = text.find('a').next().text();
                    eng.setText(first_text);
            
                    var next = p.next('p');
                
                    if (next.find('span.point1').text() == ""){
                        var next_text = next.text();
                        eng.addPara(next_text);
                    }
            english_array.push(eng);
        }
    })  
            fulfill(english_array);

        } catch(ex){
            reject(ex);
        }
    })
}
module.exports.get_data = get_data;

var get_multiple_english = function (bodies){
    var promises = [];
    bodies.forEach(function(body){
        promises.push(get_data(body));
    })
    return Promise.all(promises);
}

module.exports.get_multiple_english = get_multiple_english;

var fixdata = function(data){   //This should use a flattening function like concatAll
    var first = data[0];
    for(var  i = 1 ; i < data.length; i++){
        data[i].forEach(function(one){
            first.push(one);
        })
    }
    return first;
}

module.exports.fixdata = fixdata;


var fixid = function(data){  
    data.forEach(function(one){
        if(one.id[one.id.length-1] == '.'){  //Filter Function instead
            var newid = one.id.slice(0, one.id.length-1);
            one.id = parseInt(newid);
        }
    });
    console.log('fixed ids');
    return data;
}
module.exports.fixid = fixid;

var returnone = function(data , num){
    var theone;
    data.forEach(function(one){
        if (one.id == num ){
            theone = one;
        }
    })
    console.log(theone);
    if(!theone){
        return{
            id: "COULDNT FIND",
            type: "COULDNT FIND",
            paragraph: ['COULD NOT FIND']
        }
    }
      return theone;
    }
module.exports.returnone = returnone;

var getpair = function(hegel , findlay , num){
    var both = {};
    both.hegel = returnone(hegel, num);
    both.findlay = returnone(findlay, num);
    return both;
}

module.exports.getpair = getpair;

var getmanypair = function(hegeldata , findlaydata, low , high){
    var many = [];
    for(var i = low; i <= high; i++){
        many.push(getpair(hegeldata, findlaydata, i));
    }
    return many;
} 
module.exports.getmanypair = getmanypair;

var make_section = function( both ){

    var data = new Hegel({
        number: both.hegel.id,
        hegel: {
            type: "english",
            id: both.hegel.id,
            text: both.hegel.text
        },
        findlay: {
            type: both.findlay.type,
            id: both.findlay.id,
            text: both.findlay.text
        }
    });
    return data;
}

module.exports.make_section = make_section;

var make_many_sections = function( sections ){
    console.log('making many secs');
    var sects = [];
    sections.forEach(function(section){
        var sec = make_section(section);
        sects.push(sec);
    })
    return sects;
}
module.exports.make_many_sections = make_many_sections;

var save_many = function(secs){
    secs.forEach(function(sec){
        sec.save(function(err){
            console.log(err);
        })
    })
}  
module.exports.save_many = save_many;
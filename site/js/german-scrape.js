var exports = module.exports = {}
var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');


var get_german = function(url){
	return new Promise(function(fulfill, reject){
		try{
			request( url , function (error, response, body){
				if ( !error && response.statusCode == 200){
					fulfill(body);
				}
			})
		} catch (ex){
			reject(ex);
		}
	});
};

module.exports.get_german = get_german;

var scrape_german = function(cheer){
	var $ = cheerio.load(cheer);
	var german = return_german_obj($('body'));
	function return_german_obj(german){

		var all = [];
		var p = german.find('p');
		p.each(function(){
			var id; var text;
			var item = {id: "" , text: ""};
			console.log($(this));
			var cur_p = $(this);
			var aa = cur_p.find('a');

			aa.each(function(){
				var a = $(this);
				var germ_reg = /p\d\d/ || /p\d\d\d/;

				if (germ_reg.test( a.attr('id'))){
					var id  = a.attr('id');
					id = id.slice(1,4) || id.slice(1,3) || id.slice(1,2);
					var german_text = a.parent().text();
					item.id = id;
					item.text = german_text;
					all.push(item);
				}
			})
		})
		return all;
	}
	return german;
}

module.exports.scrape_german = scrape_german;
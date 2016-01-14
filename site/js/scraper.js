var exports = module.exports = {}
var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');


var get_toc = function(url){
	return new Promise(function(fulfill, reject){
		try{
			request( url , function (error, response, body){
				if (!error && response.statusCode == 200){
					fulfill(body);
				}
			})
		} catch(ex){
			reject(ex);
		}
	})
}
module.exports.get_toc = get_toc;

var get_links = function(cheer){
	var $ = cheerio.load(cheer);
	var links = [];

	var all_anchors = $('a');

	all_anchors.each(function(){
		var cur = $(this).attr('href');
		var reg = /\.\.\/ph\//;
		if( reg.test(cur) ) {
			cur = cur.slice(2, cur.length);
			var newtext = "https://www.marxists.org/reference/archive/hegel/works" + cur;
			links.push(newtext);
		} 
	})
	return links;
}
module.exports.get_links = get_links;

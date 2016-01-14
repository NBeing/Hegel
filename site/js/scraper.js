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

//We need to make a function that parses the links to make sure there are no doubles.
var get_multiple = function(links){
	var promises = [];

	links.forEach(function(link){
		console.log('working on' + link);
		promises.push(get_toc(link))
	})
	return Promise.all(promises);
}
module.exports.get_multiple = get_multiple;
var get_links = function(cheer){

	return new Promise(function(fulfill, reject){

		try{
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
			fulfill(links);
		} catch(ex){
			return(ex);
		}
	})
}
module.exports.get_links = get_links;


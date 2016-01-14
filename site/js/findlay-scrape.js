var exports = module.exports = {}
var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');


var get_findlay = function(url){
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

module.exports.get_findlay = get_findlay;

var scrape_findlay = function(cheer){
	var $ = cheerio.load(cheer);
	var findlay_array = [];
	var findlays  = $('body').find('a');

	findlays.each(function(){
		var id , text , type;
		var json = { type: "findlay", id : "" , text: ""};
		var cur = $(this);
		var name;
		var reg = /m\d/ ||  /m\d\d/ || /m\d\d\d/;

		if( cur.attr('name') && reg.test(cur.attr('name'))){
			name = cur.attr('name');
			name = name.substring(1, name.length);

			if ( name[0] == "0"){
				name = name.substring(1,name.length);
			}
			next = cur.next();

			next.each(function(){
				$('span.point1').remove();
				json.id = name;
				json.text = $(this).text();
				findlay_array.push(json);
			});
		};
	})
	return findlay_array;
}

module.exports.scrape_findlay = scrape_findlay;
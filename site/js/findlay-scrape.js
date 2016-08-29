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

var make_links = function(){
	return new Promise(function(fulfill, reject){
		try{
			var urls = [];

			//This is for test, but you really should pull the links from the following page
			//https://www.marxists.org/reference/archive/hegel/help/findlay.htm
			// use /help to filter out the links;
			urls.push('https://www.marxists.org/reference/archive/hegel/help/finpref.htm');
			urls.push('https://www.marxists.org/reference/archive/hegel/help/finintro.htm');
			var url = 'https://www.marxists.org/reference/archive/hegel/help/findlay';
			var ending = '.htm';
			var num = 6;

			for (var i = 1; i < num; i++){
				var newurl;
				newurl = url + i + ending;
				urls.push(newurl);
			}

			fulfill(urls);
	
		} catch(ex){
			reject(ex);
		}
	})
}
module.exports.make_links = make_links;

var get_multiple = function(links){
	return new Promise(function(fulfill, reject){
		try{

			var promises = [];
			links.forEach(function(link){
				try{
					promises.push(get_findlay(link))
				} catch (ex){
					console.log(ex);
				}
			})
			fulfill(Promise.all(promises));
		} catch(ex){
			reject(ex)
		}
	})
}
module.exports.get_multiple = get_multiple;
var scrape_multiple = function(bodies){
	return new Promise(function(fulfill , reject){
		try {
			var promises =[];
			bodies.forEach(function(body){
				promises.push(scrape_findlay(body));
			})
		fulfill(Promise.all(promises));
		}catch(ex){
			reject(ex);
		}
	})
}
module.exports.scrape_multiple = scrape_multiple;

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
				if(json.text == ""){
					try{
						json.text = $(this).parent().text();
					} catch(ex){

					}
				}
				findlay_array.push(json);
			});
		};
	})
	return findlay_array;
}

module.exports.scrape_findlay = scrape_findlay;
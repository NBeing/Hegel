var exports = module.exports = {}
var Promise = require('promise');
var cheerio = require('cheerio');
var request = require('request');
var _ = require('underscore');

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


var remove_id_links = function(links){
	
	var with_id = [];
	var without_id = [];
	
	links.forEach(function (link){
		var reg = /\#\d/;
		if (reg.test(link)){
			with_id.push(link);
		}else{
			without_id.push(link);
		}
	})
	var data = {
		with_id: with_id,
		without_id: without_id
	}
	return data;
}
module.exports.remove_id_links = remove_id_links;

var slice_id = function(links){
	console.log("Slicing IDs");
	var sliced = [];
	links.with_id.forEach(function(link){
		var pos = link.indexOf("#");
		var newlink = link.substring(0 , pos);
		//console.log(newstring);
		sliced.push(newlink);
	});
	return sliced;

}
module.exports.slice_id = slice_id;

var remove_duplicates = function(links){
	console.log("removing duplicates");
	var origlength = links.length;
	links = _.uniq(links);
	var newlength = links.length;
	console.log("started with " + origlength + " items");
	console.log("ended with " + newlength + " items");
	console.log(" " + (origlength -newlength) + " items were removed");

	return links;
}
module.exports.remove_duplicates = remove_duplicates;
var compare_with_and_without = function(all, sliced){
	console.log('comparing links');

	var dupes = [];

	sliced.forEach(function(sliced_link){
		all.forEach(function(link){
			if(link == sliced_link){
				console.log(sliced_link);
				dupes.push(link);
			}
		})
	}) //End sliced
		console.log(dupes.length == sliced.length);
}
module.exports.compare_with_and_without = compare_with_and_without;

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

var test_section = function ( possible ){
    //First test: Get all links with 1, 2, or 3 digits
    var reg  =/\d/ || /\d\d/ ||  /\d\d\d/;
    if (reg.test(possible)){
            //If this is the case, lets look for parentheses
            //These are links within the phenomenology, not sections
            var reg2 = /\(/;
            if( !reg2.test(possible) ) {  //Don't use the ones with parens

                //Luckily for me it looks like all footnote links
                //end with a trailing whitespace
                //Let's use this fact to remove those from our array;
                var reg3 = /\s/;
                var last = possible.substring(possible.length-1, possible.length);
                if (!reg3.test(last)){
                	return true;
                }
            }
        }
    }
module.exports.test_section = test_section;

var test_for_headings = function ( el ){
	if(    el.get(0).tagName == 'h3' 
		|| el.get(0).tagName == 'h4'
		|| el.get(0).tagName == 'h1'
		|| el.get(0).tagName == 'h5'
		){  return true }
}
module.exports.test_for_headings = test_for_headings;

var test_and_run_current = function (el , tests){
	if (el){
		tests(el);
	} else {
		console.log('no element found');
	}
}
module.exports.test_and_run_current = test_and_run_current;

var tests = function tests(el){
	console.log('firing test on : ' + el.get(0).tagName);
	if( el.is('p')){
		console.log('found paragraph')
        //find the ID
        if(el.find('a').length > 0){

        	var as = el.find('a');
        	console.log('found a');
        	console.log(el.find('a').length);
        	as.each(function(){
        		var possible = $(this).text();
        		console.log("possible is : " + possible)

        		if(test_section(possible)){
                    // Get rid of trailing period
                    var reg  = /\./;
                    if (reg.test(possible)){
                    	possible = possible.substring(0 , possible.length-1);
                    }
                    console.log('pushing : ' + possible)
                    table.push(possible);
                } else {
                	console.log('failed test: ' + possible);
                }
            })            
        } if(el.hasClass('footer')){
        	console.log("reached footer");
        	return
        }
        else { 
        	console.log( "Found paragraph with no anchor , moving on")
        }

        cur = el.next();
        console.log("Next element is " + el.get(0).tagName)
        console.log("type : "  + typeof(cur));
        test_and_run_current(cur , tests);
    } else if(test_for_headings(el)){
        //Push to array
        console.log('Found heading , pushing : ' + el.text())
        var head = [];
        head.push(el.get(0).tagName);
        head.push(el.text());
        table.push(head);
        //first is equal to first.next
        cur = el.next();
        //run the function again
        tests(cur);
    } else {
    	console.log("found this: " + el.get(0).tagName);
    	cur = el.next();
    	console.log("Not h3 or p , Next element is " + cur)
    	test_and_run_current(cur , tests);
    }
}
module.exports.tests = tests;

var parse_each_page = function($){
	var table = [];
	console.log("");
	console.log('Begining of Page --------')
	var cur = $('h1').first();
	console.log("Main heading is: " + cur.text());

	table.push(['h1',cur.text()]);
	cur = cur.next();
	test_and_run_current(cur , tests);


	return table;
}
module.exports.parse_each_page = parse_each_page;

var get_all_tables = function(data){
    var allofem = [];

    data.forEach(function(body , index){
        //Load the body
        try{ var $ = cheerio.load(body); } 
        catch(ex){ console.log(ex); }
        
        allofem.push(parse_each_page($))
    })
    return allofem;
}
module.exports.get_all_tables = get_all_tables;


var convert_to_obj = function ( allofem ){
    var table = [];
    var temp = [];
    var previousname;

    allofem.forEach(function(page){

        page.forEach(function(item , index){
        
            if(Array.isArray(item)){
        
                function setPrev (table , title){
                    try{
                        table.forEach(function(entry){
                            if(entry.title == previousname){
                                entry.subsections = temp;
                                temp =[];
                            }
                    })
                    } catch(ex){
                        console.log(ex);
                    }
                }  
                try{
                setPrev(table , previousname);
                } catch(ex){
                    console.log(ex);
                }
                var table_element = {};
                table_element.type = item[0];
                table_element.title = item[1];
                previousname = item[1];
            
            } else {
                temp.push(item);
                //Write a function that looks ahead or behind
            }
            
            if(table_element){
                table.push(table_element);
            }

        })
     
    }) 
    return(table);   
}
module.exports.convert_to_obj = convert_to_obj;

var nest_chapters = function (table){

	var newtable = [];
	var temparr = [];
	var lastname = [];
	var h3arr = [];
	var h4temp = [];
	var lasth3 = [];

	table.forEach(function(item , index){
		if(index == table.length-1){
        //figure out how to get the last section to act right
    }
    if(item.type == 'h1' ){

    	table.forEach(function(entry , index){

    		if(entry.title == lastname[lastname.length-1] || entry.title == lasth3){
    			try{

    				if(h4temp.length == 0 && h3arr.length == 0){
    					newtable.push(entry)
    				}
    				if(h4temp.length > 0 && h3arr.length == 0 ){ 
    					entry.subchapters = h4temp;
    					h4temp = [];
    					newtable.push(entry);
    				}

    				if(h3arr[0] !== undefined ){
                        //console.log(h3arr);
                        entry.subchapters = h3arr;
                        h3arr = [];
                        newtable.push(entry);
                    }

                }catch(ex){
                	console.log(ex);
                }
            }
        })

    	item.subchapters = [];
    	lastname.push(item.title);
    }
    if(item.type == 'h3'){
    	table.forEach(function(ent){
    		if(ent.title == lasth3[lasth3.length -1]){
    			try{
    				ent.subchapters = h4temp;
    				h3arr.push(ent)
    			} catch(ex){
    				console.log(ex);
    			}
    		}

    		item.subchapters = [];
    		h4temp =[];
    		lasth3.push(item.title);
    	})
    }

    if(item.type == 'h5' ){
    	console.log("found h5");
    	h4temp.push(item);
    	console.log(h4temp);
    }   
    if(item.type == 'h4' ){
    	h4temp.push(item);
    }   

})
return newtable;
}
module.exports.nest_chapters = nest_chapters;
var parse_without_tests = function ($){
	var table = [];
	console.log("");
	console.log('Begining of Page --------')
	var cur = $('h1').first();
	console.log("Main heading is: " + cur.text());

	table.push(['h1',cur.text()]);
	cur = cur.next();
	test_and_run_current(cur , tests);

	function tests(el){
		console.log('firing test on : ' + el.get(0).tagName);
		if( el.is('p')){
			console.log('found paragraph')
            //find the ID
            if(el.find('a').length > 0){
                var as = el.find('a');
                console.log('found a');
                console.log(el.find('a').length);
                as.each(function(){
            		var possible = $(this).text();
            		console.log("possible is : " + possible)

            		if(test_section(possible)){
                        // Get rid of trailing period
                        var reg  = /\./;
                        if (reg.test(possible)){
                        	possible = possible.substring(0 , possible.length-1);
                        }
                        console.log('pushing : ' + possible)
                        table.push(possible);
                    } else {
                    	console.log('failed test: ' + possible);
                    }
                })            
            } 

            if(el.hasClass('footer')){
            	console.log("reached footer");
            	return
            } else { 
            	console.log( "Found paragraph with no anchor , moving on")
            }
            
            cur = el.next();
            console.log("Next element is " + el.get(0).tagName)
            console.log("type : "  + typeof(cur));
            test_and_run_current(cur , tests);
        } else if(test_for_headings(el)){
            //Push to array
            console.log('Found heading , pushing : ' + el.text())
            var head = [];
            head.push(el.get(0).tagName);
            head.push(el.text());
            table.push(head);
            cur = el.next();
            tests(cur);

        } else {
        	console.log("found this: " + el.get(0).tagName);
        	cur = el.next();
        	console.log("Not h3 or p , Next element is " + cur)
        	test_and_run_current(cur , tests);
        }
    }
	    return table;
}


module.exports.parse_without_tests = parse_without_tests;
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

var Chapter = function(type , title , subsections){
    this.type = type;
    this.title = title;
    this.subsections = subsections;
}
module.exports.Chapter = Chapter;

var convert_to_obj = function ( allofem , Chapter){
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
                var table_element = new Chapter();
                table_element.type = item[0];
                table_element.title = item[1];
                previousname = item[1];
            
            } else {
                temp.push(item);
            }
            
            if(table_element){
                table.push(table_element);
            }
        })
    }) 
    return(table);   
}
module.exports.convert_to_obj = convert_to_obj;

function look(table , index, delta ){
    return table[index+delta];
}

function find_next_of_type(cur, type){
    if(cur.type == type){

    }
}

var look_until =  function(type , table , index , arr){
    var counter = 1;
    var newarr = arr;
    var non = false;
    do { 
        //console.log("doing");
        try{
        var cur = look(table , index , counter);
        console.log("working on " + cur.title)            
        } catch (ex) {
            console.log(ex);
        }
        if (!cur) {
            console.log(" no item");
            non = true;
            newarr.push(cur);
        }
        if(cur.type == type){
            console.log("Found same type on " + cur.title)
            non = true;
        } else if(cur.type != type){
            console.log("Found diff type")
            console.log("Pushing : " + cur.type + " " + cur.title);
            newarr.push(cur);
            counter = counter+1;
        } 
    } while(non == false)
    console.log(newarr);
    return newarr;
}

var getSubchapters = function(chapter){
    var subchapters  = [];
    if(chapter.subchapters && chapter.subchapters.length > 0 ){
        chapter.subchapters.forEach(function(subchapter){
            subchapters.push(subchapter);
        })
    }
    return subchapters;
}
module.exports.getsubchapters = getSubchapters;

var checkForChapter = function(chapter,  title){
        if(chapter.title && chapter.title == title){
            return chapter;
        } else {
            return false;
        }
}
module.exports.checkForChapter = checkForChapter;
var getallofem = function getallofem(bodies){
            var toc = [];
            var allofem = [];

            bodies.forEach(function(body , index){
            //Load the body
            try{ var $ = cheerio.load(body); } 
            catch(ex){ console.log(ex); }

            allofem.push( parse_without_tests($))
            //Now data looks like this
            })
            return allofem;
        }
module.exports.getallofem = getallofem;
function set_bounds (table){
    var newtable = [];
    table.forEach(function(chapter){
        var upper;
        var lower;
        var boundaries;
        //Lower
        try{
            if(chapter.subsections.length > 0){
                console.log("subsections exist ... ")
                lower = chapter.subsections[0];
                console.log("Found lower : " + lower)
            }
            if (chapter.subsections.length == 0){
                console.log("no subsections");
                lower = chapter.subchapters[0].subsections[0];
                console.log('Found lower : ' + lower)
            }
            //Upper
            if(chapter.subchapters.length == 0){
                console.log("no subchapters")
                upper = chapter.subsections[chapter.subsections.length-1];
                console.log("found upper: " + upper)
            } else {
                console.log("Found subchapters ")
                upper = chapter.subchapters[chapter.subchapters.length-1]
                upper = upper.subsections[upper.subsections.length-1];
                console.log("found upper: " +  upper)
            }
            chapter.first_section = lower;
            chapter.last_section = upper;
            newtable.push(chapter);
        } catch (ex) {
            console.log(ex)
        }
    })
return newtable;
}
module.exports.set_bounds = set_bounds;
var lookForChapter = function(table , title ){
    
    table.forEach(function(chapter){
        var subchaps = getSubchapters(chapter);
        if( checkForChapter(chapter , title ) != false ){
            console.log(checkForChapter(chapter , title ));
        }

        subchaps.forEach(function( subchapter){
            var subsubchaps = getSubchapters(subchapter);
            if( checkForChapter(subchapter , title ) != false ){
                   console.log(checkForChapter(subchapter , title ));
            }
            subsubchaps.forEach(function(subsubchapter){
                                    console.log(subsubchapter.title)
                var subsubsubchaps = getSubchapters(subsubchapter);
                if( checkForChapter(subsubchapter , title ) != false ){
                       console.log(checkForChapter(subsubchapter , title ));
                }
                subsubsubchaps.forEach(function(subsubsubchapter){

                    var subsubsubsubchaps = getSubchapters(subsubsubchapter);
                    if( checkForChapter(subsubsubchapter , title ) != false ){
                           console.log(checkForChapter(subsubsubchapter , title ));
                    } 
                     if (subsubsubchapter.subchapters.length > 0){
                        console.log("Theres more buddy");
                    }
                })
            })
        })
    })
}
module.exports.lookForChapter = lookForChapter;

var nest_chapters2 = function (table){
    
    var newtable = [];
    var prev_h1 = [];
    var prev_h3 = [];
    var h1 = [];
    var h3 = [];
    var h4 = [];
    var h5 = [];

    table.forEach(function(item , index ){
        item.subchapters = [];

        
        if(item.type == 'h1'){
            console.log("Found h1 . . .");
            var h1s = look_until('h1' , table , index , h1);

            h1s.forEach(function( it , index2){
                if(it.type == 'h3'){
                    console.log("found h3");
                    try{
                        h4 = look_until('h3', h1s , index2 , h4);
                        it.subchapters.push(h4)

                        h4 = [];
                    } catch (ex){
                        console.log(ex);

                    }
                    h3.push(it);
                    // h4s.forEach(function(el){
                    //     console.log(el);
                    // })
                    // h3.push(it);
                }
                if(it.type == 'h4'){
                    console.log("found h4");
                }
                if(it.type == 'h1'){
                        console.log("Push it now");
                    }
                // if(it.type == 'h4'){
                //     var x = look_until('h5', );
                // }
            })
            item.subchapters = h3;
            console.log(h3);
            h3 = []
        }
        newtable.push(item);
    })

    return newtable;
}
module.exports.nest_chapters2 = nest_chapters2;


Array.prototype.unshiftall = unshiftall;
Array.prototype.pushall = pushall;
function pushall ( dest ){
    var self = this;
    if(Array.isArray(self) && Array.isArray(dest)){
        dest.forEach(function(item){
            self.push(item);
        })

    }else{
        console.log("Not an array!");
    }
}
function unshiftall ( dest ){
    var self = this;
    if(Array.isArray(self) && isArray(dest)){
        dest.forEach(function(item){
            self.unshift(item);
        })

    }else{
        console.log("Not an array!");
    }
}

function process( arr ){
    var newarr = [];
    temp = [];
    
    for(var i = arr.length-1 ; i >=0 ; i--){
        if( i == 0){
            try{
                arr[i].subchapters.pushall(newarr);
                return arr[i]                
            } catch(ex){
                console.log(ex);
            }
        } 
        else if(arr[i-1].type == arr[i].type){
            try{
                temp.unshift(arr[i])
            } catch(ex){
                console.log(ex);
            }

        } else if(arr[i-1].type != arr[i].type){
            if(    arr[i-1].type == 'h5' && arr[i].type == 'h4'
                || arr[i-1].type == 'h4' && arr[i].type == 'h3' //what about h5 && h3
                || arr[i-1].type == 'h5' && arr[i].type == 'h3'
               
                ){
                try{
                    arr[i].subchapters.pushall(temp);
                    temp = [];
                    newarr.unshift(arr[i])                    
                } catch (ex) {
                    console.log(ex);
                }

            } else{
                try{
                    console.log("firing normal 'else'")
                    temp.unshift(arr[i])

                    arr[i-1].subchapters.pushall(temp);
                    temp = [];                    
                } catch(ex){
                    console.log(ex);
                }
            }
        }
    }
}
var nest_chapters = function(table){
    var newtable = [] ;
    var h1 = [];

    table.forEach(function( item , index){
        item.subchapters = [];
        if(item.type == 'h1'){
            console.log("Looking at h1")
            if(h1.length > 0 ){
                h1 = process(h1);
                    newtable.push(h1)
            
                //console.log(h1);
                h1 = [];
            }
            h1.push(item);
        } else {
            h1.push(item);
        }
    })
    return newtable;
}
module.exports.nest_chapters = nest_chapters;

var nest_chapters3 = function (table){
    var h1 = [];
    table.forEach(function(item , index){
        if(item.type == 'h1'){

            var h1s = look_until('h1' , table , index , h1);
            if(h1s){
                console.log("Found h1s")
                for(var i = h1s.length-1; i >= 0; i--){
                    
                    if(h1s[i].type == "h5"){
                        var h5 = [];
                        var count = 1;
                        h5.push(h1s[i]);
                        console.log("Found an h5");
                        
                        function lookin( h5 , counter , h1s,  i){
                            if(h1s[i - counter].type == 'h5'){
                                h5.push(h1s[i - counter]);
                                count += 1;
                                lookin(h5 , count , h1s , i );
                            } 
                            if( h1s[i-counter].type == 'h4' ){
                                h1s[i-counter].subchapters = h5;
                                count += 1;
                                console.log('appended' + h5.length + "to" + h1s[i-counter].title );
                                h5 = [];
                            }

                            if( h1s[i-counter].type == 'h3'){
                                console.log("end of the night");
                                h1s[i-counter].subchapters = h5;
                                count += 1;
                                console.log( h1s[i-counter].subchapters);
                                h5 = [];
                            }
                              lookin(h5 , count , h1s , i );
                        i-= count;
                        h5 = [];
                        }

 
                    }
                }
            }
        }
    })
}
module.exports.nest_chapters3 = nest_chapters3;

var nest_chaptersold = function (table){

	var newtable = [];
	var temparr = [];
	var lastname = [];
	var h3arr = [];
	var h4temp = [];
	var lasth3 = [];
	var h5temp = [];
	var lasth4 = [];
	var h4arr = [];

	table.forEach(function(item , index){
		if(index == table.length-1){
        //figure out how to get the last section to act right
    }
    if(item.type == 'h1' ){

    	table.forEach(function(entry , index){

    		if(entry.title == lastname[lastname.length-1] || entry.title == lasth3[lasth3.length-1]){
    			try{

    				if(h4arr.length == 0 && h3arr.length == 0){
    					newtable.push(entry)
    				}
    				if(h4arr.length > 0 && h3arr.length == 0 ){ 
    					entry.subchapters = h4arr;
    					h4arr= [];
    					newtable.push(entry);
    				}

    				if(h3arr[0] !== undefined ){
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
    				if(h5temp.length == 0 && h4arr.length == 0){
    					console.log('no h4 or h5')
    					h3arr.push(ent);
    				}
    				if(h5temp.length > 0 && h4arr.length == 0){
    						console.log("found h5s and no h4")
    					ent.subchapters = h5temp;
    					h5temp =[];
    					h3arr.push(ent);
    				}
    				if(h4arr.length > 0 ) {
    					console.log('found h4')
    					ent.subchapters = h4arr;
    					h4arr = [];
    					h3arr.push(ent);
    				}
		
    			} catch(ex){
    				console.log(ex);
    			}
    		}
    		item.subchapters = [];
    		lasth3.push(item.title);
    	})
    }
    if(item.type == 'h4' ){

    	table.forEach(function(entr){
    		if(entr.title == lasth4[lasth4.length-1] ){
    			try{
    				if(h5temp.length == 0 && h4arr.length == 0){
    					h4arr.push(entr);
    				}
    				if(h5temp.length > 0 && h4arr.length == 0 ){
    				entr.subchapters = h5temp;
    				h5temp = [];
    				h4arr.push(entr)
    				}
    				if(h4arr.length > 0 ){
    					entr.subchapters = h5temp;
    					h5temp = [];
    					h4arr.push(entr);
    				}

    			} catch (ex){
    				console.log(ex);
    			}
    			
    		}
    		item.subchapters =[];
    		lasth4.push(item.title);

    	})
    }   

    if(item.type == 'h5' ){
    	console.log(item.title);
    	h5temp.push(item);
    }   

})
return newtable;
}
module.exports.nest_chaptersold = nest_chaptersold;

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
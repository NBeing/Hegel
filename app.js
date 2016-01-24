//Utilities
var Promise = require('promise');
var async = require('async');
var fs  = require('fs');
var _ =  require('underscore');

//Express App
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();

app.use(express.static('site'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


//Libraries for parsing pages / helping to scrape
var cheerio = require('cheerio');
var request = require('request');

//Load the node wikipedia module
var wikipedia = require("wikipedia-js");

//Loads Natural + functions + my own helper functions
var natural = require('natural');
var wordnet = new natural.WordNet();
var tokenizer = new natural.WordTokenizer();
var natty = require('./site/js/natural.js');

//These load the functions for scraping
var eng = require('./site/js/eng.js');
var findlay = require('./site/js/findlay-scrape.js');
var german = require('./site/js/german-scrape.js');
var scraper = require('./site/js/scraper.js');

//Connect to mongodb database and require our hegel text schema
var mongoose = require('mongoose');
mongoose.connect('mongodb://userx:userxpass@ds045465.mongolab.com:45465/alltest');
var Hegel = require('./site/js/hegelscheme.js');

//Tell us when the route is being called
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/hegels')  //Post or get the data to the mongodb database

.post(function(req, res) {

        //Get the findlays from the route;
        var findlay_url = 'http://localhost:3000/findlay' 
        
        //This is the Table of Contents page for the Phenomenology    
        url = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';
        
        var alldata = [];
        findlay.get_findlay(findlay_url).then(function(data){
            try{
                data = JSON.parse(data);                
            } catch (ex){
                console.log(ex);
            }
            alldata.push(data);
        })

        scraper.get_toc(url)  //Get the TOC from url
            .then(function(data){     
                return scraper.get_links(data);   //Get all the links from the TOC
            })
            .then(function(data){                 
                return scraper.get_multiple(data); //Get all of the pages from the links           
            })
            .then(function(data){
                return eng.get_multiple_english(data);  //Parse all of the data into an object
            })
            .then(function(data){

                var hegeldata = eng.fixdata(data);
                hegeldata = eng.fixid(hegeldata);
                
                var findlaydata = alldata[0];
                findlaydata = eng.fixdata(findlaydata);

                var many = eng.getmanypair(hegeldata, findlaydata, 1, 500);

                 var secs = eng.make_many_sections(many);
                //eng.save_many(secs);
               
                res.send(secs);
            });
})

.get(function(req, res) {
    Hegel.find(function(err, hegels) {
        if (err)
            res.send(err);

        res.json(hegels);
    });
});

//Find a single ID in the mongodb database

//Really need to figure out where the extra container is being added.
router.route('/hegels/:id')  

    .get(function(req, res) {
        var id = req.params.id;

        console.log("Getting: " +id);

        Hegel.findOne({number:id}, function(err, hegel ){
            if(err){
                console.log(err)
            }

            var words = [];
            console.log(hegel.hegel);
            //Gotta fix this so it adds both arrays
           words[0] = [];
           hegel.hegel.text.forEach(function(one){
            words[0].push(one);
           })
           words[0].forEach(function(one , index){
            words[index] = tokenizer.tokenize(one);
           })

           res.send(words);
        })
    });


//Get a single word from the Wordnet Database
router.route('/hegels/word/:word')
    .get( function(req , res ) {
        var word = req.params.word;

        natty.getToken(word).then(function(data){
            console.log(data);
            res.send(data);
        })
    })


//Route for Wikipedia Queries
router.route('/wiki/:query')
    .get(function(req, res){

        var query = req.params.query;
        var options = {query: query, format: "html", summaryOnly: true};

        wikipedia.searchArticle(options, function(err, htmlWikiText){
            if(err){
            console.log("An error occurred[query=%s, error=%s]", query, err);
            return;
        }
                res.send(htmlWikiText);

    })
    });



//These three routes scrape of the section text (German, Findlay , English)
    //  1) Need to make a scraper that starts from the TOC and then populates these
    //  2) Figure out a way to get the headings
    //  3) Next you need to put these all into MongoDB

app.get('/german', function(req, res){
    german.get_german('https://www.marxists.org/deutsch/philosophie/hegel/phaenom/kap1.htm#p90')
        .then(function(data){;
            data = german.scrape_german(data);
            res.send(data);
        })
})

app.get('/findlay', function(req, res){
    findlay.make_links().then(function(data){
        return findlay.get_multiple(data);
    })
    .then(function(data){
        return findlay.scrape_multiple(data);
    })
    .then(function(data){
        res.send(data);
    })
})

app.get('/english' , function(req, res){
    eng.getit('https://www.marxists.org/reference/archive/hegel/works/ph/phaa.htm').
        then(function(data){
            var data = eng.get_data(data);
            res.send(data);
        });
});


//(WIP) get the number of each section within each chapter
app.get('/toc' , function(req, res){

//This is the Table of Contents page for the Phenomenology
var url2 = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';

scraper.get_toc(url2).then(function(data){
    return scraper.get_toc(url2);
})
.then(function(data){
    return scraper.get_links(data);
})
.then(function(data){

    //Remove Duplicates from all;
    var all_no_dupes = scraper.remove_duplicates(data);
   
    // parse out the links which have links to id's 
    var newdata = scraper.remove_id_links(data);
    
    //newdata object now has 2 properties ('with_id' and 'without_id');
    //Let's take the links with id's and slice them off
    var sliced_links = scraper.slice_id(newdata);

    //Remove the duplicates
    sliced_links = scraper.remove_duplicates(sliced_links);

    //This function checks whether all of the sliced links 
    //also exist in the original data
    //if logs true then we dont have to worry about cleaning up
    //the data because all of the sliced links exist
    scraper.compare_with_and_without(all_no_dupes, sliced_links);

    //Now we know that our newdata.without_id has only clean data
    //it should not be missing a TOC element
    var clean = newdata.without_id;
    return clean;
})

.then(function(data){
        return scraper.get_multiple(data);
})

.then(function(data){

    var toc = [];
    var allofem = [];

    function test_section ( possible ){
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
        function test_for_headings(el){

            if(        el.get(0).tagName == 'h3' 
                    || el.get(0).tagName == 'h4'
                    || el.get(0).tagName == 'h1'
                    || el.get(0).tagName == 'h5'
                
                ){  return true }
        
        }
        function test_and_run_current(el , tests){
            if (el){
                tests(el);
            } else {
                console.log('no element found');
            }
        }


    data.forEach(function(body , index){
        //Load the body
        try{ var $ = cheerio.load(body); } 
        catch(ex){ console.log(ex); }
        
        function parse_without_tests($){
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
            return table;
        }
        allofem.push( parse_without_tests($))
    })

//res.send(allofem);
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

//res.send(table);
var newtable = [];
var temparr = [];
var lastname;

var h3array = [];
var h4array = []; 

table.forEach(function(item){

    if(item.type == 'h1'){
        table.forEach(function(entry){
            if(entry.title == lastname){
                try{
                   entry.subchapters = temparr;
                   console.log(entry.subchapters)
                   newtable.push(entry);
                }catch(ex){
                    console.log(ex);
                }
            }
        })
        
        item.subchapters = [];
       lastname = item.title;
        console.log(lastname)
    }
    if(item.type == 'h3'){
        table.forEach(function(entry){
             if(entry.title == lastname){
                try{
                   entry.subchapters = temparr;
                   console.log(entry.subchapters)
                   newtable.push(entry);
                }catch(ex){
                    console.log(ex);
                }
            }
        })
    }
    else if(item.type == 'h4'){
        console.log(item);
        temparr.push(item);
    }  
})

res.send(newtable);

//     function pairem(table , all){
//         table.forEach(function(entry){
//             console.log(entry.title);

//             all.forEach(function(page){
//                 page.forEach(function(ind , index){
//                     if(ind[1] == entry.title){
//                         console.log(index);
//                     }
//                 })
//             })
//         })
//     }
//     pairem(table, allofem);
//     res.send(table);
// function isEmpty(obj) {
//     for(var prop in obj) {
//         if(obj.hasOwnProperty(prop))
//             return false;
//     }

//     return true;
// }
// var clean_array= [];
//     table.forEach(function(entry){
//         if(!isEmpty(entry)){
//             clean_array.push(entry);
//         }
//     })
//     res.send(clean_array);
})
});
app.use('/api' , router);

var server = app.listen(3000, function () {
    var address = server.address().address
    var host    = (address === '::' ? 'localhost' : address);
    var port    = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

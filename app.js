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
var Toc = require('./site/js/TocSchema.js');

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

                var many = eng.getmanypair(hegeldata, findlaydata, 1, 800);

                 var secs = eng.make_many_sections(many);
                eng.save_many(secs);
               
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

    var id = Number(req.params.id);
    console.log("Getting: " +id);

    Hegel.findOne({'number':id}, function(err, hegel ){
        if(err){
            console.log(err);
        }
        var words = [];
        words[0] = [];
        
        try{
            
        hegel.hegel.text.forEach(function(one){
            words[0].push(one);
        })
        }catch(ex){
            console.log(ex);
        }
        words[0].forEach(function(one , index){
            words[index] = tokenizer.tokenize(one);
        })

        res.send(words);
    })
});

router.route('/hegels/findlay/:id')  

.get(function(req, res) {

    var id = Number(req.params.id);
    console.log("Getting: " +id);

    Hegel.findOne({'number':id}, function(err, hegel ){
        if(err){
            console.log(err);
        }
        var words = [];
        words[0] = [];
       
        try{
             hegel.findlay.text.forEach(function(one){
            words[0].push(one);
        })
        }catch(ex){
            console.log(ex);
            res.send('');
        }
        words[0].forEach(function(one , index){
            words[index] = tokenizer.tokenize(one);
        })

        res.send(words[0]);
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
    .then(function(data){
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

//Pretty sure you can delete this route
// app.get('/english' , function(req, res){
//     eng.getit('https://www.marxists.org/reference/archive/hegel/works/ph/phaa.htm').
//         then(function(data){
//             var data = eng.get_data(data);
//             res.send(data);
//         });
// });


//(WIP) get the number of each section within each chapter
router.route('/toc')
    .get(function(req , res ){ 
        Toc.find().then(function(data){
            res.send(data[0].table);
        })
    })
.post(function(req, res){
    //This is the Table of Contents page for the Phenomenology
    var contents = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';
    scraper.get_toc(contents)

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

        data.forEach(function(body , index){
            //Load the body
            try{ var $ = cheerio.load(body); } 
            catch(ex){ console.log(ex); }

            allofem.push( scraper.parse_without_tests($))
        })

        var table = scraper.convert_to_obj(allofem)

        table = scraper.nest_chapters4(table);  
           table = _.uniq (table , function (item , key , title){
            return item.title;
        })   
        table = get_bounds(table);
        function get_bounds (table){
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
        try{
            var toc = new Toc({table: table});
            console.log(toc);
            toc.save();
        } catch (ex){
            console.log(ex)
        }
        res.send(table);
    })
});

app.use('/api' , router);
var server = app.listen(3000, function () {
    var address = server.address().address
    var host    = (address === '::' ? 'localhost' : address);
    var port    = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

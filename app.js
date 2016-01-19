//Utilities
var Promise = require('promise');
var async = require('async');
var fs  = require('fs');

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

    var alldata = [];

        //Get the findlays from the route;
        var findlay_url = 'http://localhost:3000/findlay' 
        
        //This is the Table of Contents page for the Phenomenology    
        url = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';
        
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

           //words[0] = tokenizer.tokenize(words[0]);

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
    return scraper.get_multiple(data);
})

.then(function(data){
 var arr = [];
   data.forEach(function(body){
                    try{var $ = cheerio.load(body);}
                    catch(ex){console.log(ex);}
                   
                    var h1 = $('h1');
                    var h3 = $('h3');
                    var first_h3 = $('body').find('h3').first();
                    var btw = first_h3.nextUntil('h3');
                    btw.each(function(){
                        if( $(this).is('p') ){
                            var a = $(this).find('a');
                            a.each(function(){
                                var possible = $(this).text();
                                var reg  =/\d\d/ ||  /\d\d\d/;

                                if (reg.test(possible)){
                                    arr.push(possible);
                                }
                            })
                        }
                    })


})
      res.send(arr);
                 })
});
app.use('/api' , router);

var server = app.listen(3000, function () {
    var address = server.address().address
    var host    = (address === '::' ? 'localhost' : address);
    var port    = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

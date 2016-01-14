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

            //This is the Table of Contents page for the Phenomenology    
            url = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';

            var bodies = [];

    scraper.get_toc(url).then(function(data){ //Get the TOC from url
        
        scraper.get_links(data)               //Get all the links from the TOC
        
        .then(function(data){                 
            return scraper.get_multiple(data); //Get all of the pages from the links           
        })
        
        .then(function(data){
            return eng.get_multiple_english(data);  //Parse all of the data into an object
        })    
        .then(function(data){
            data.forEach(function(part){
                console.log('Part');
                part.forEach(function(one){
                    if(one.id[one.id.length-1] == '.'){
                        console.log("oh no period!");
                        var newid = one.id.slice(0, one.id.length-1);
                        one.id = parseInt(newid);
                        console.log(one.id);
                    }
                var hegel = new Hegel();
                hegel.id = one.id;
                hegel.text = one.paragraph[0];
                hegel.type = one.type;
                hegel.save(function(err){});
            })


            })

        });
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

        Hegel.findOne({id:id}, function(err, hegel ){
            if(err){
                console.log(err)
            }

            var words = [];

           words[0] = hegel.text.toString();
           words[0] = tokenizer.tokenize(words[0]);

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
    findlay.get_findlay('https://www.marxists.org/reference/archive/hegel/help/findlay1.htm#m090')
        .then(function(data){
            data = findlay.scrape_findlay(data);
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
app.use('/api' , router);

var server = app.listen(3000, function () {
    var address = server.address().address
    var host    = (address === '::' ? 'localhost' : address);
    var port    = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

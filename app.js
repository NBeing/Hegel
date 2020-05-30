//Utilities
var Promise = require('promise');
var async = require('async');
var fs = require('fs');
var _ = require('underscore');
var Rx = require('rxjs/Rx');
var EventEmitter = require("events").EventEmitter;
var _ = require('lodash');

//Express App
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();

app.use(express.static('site'));
app.use(bodyParser.urlencoded({ extended: true }));
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

var Wiki = require('wikijs');

//Connect to mongodb database and require our hegel text schema
var mongoose = require('mongoose');
mongoose.connect('mongodb://userx:userxpass@ds045465.mongolab.com:45465/alltest');

var Hegel = require('./site/js/hegelscheme.js');
var Toc = require('./site/js/TocSchema.js');

var ee = new EventEmitter();

app.disable('x-powered-by');
app.all('/', function (req, res, next) {
    console.log("Trynna set some headers")
    next();
});
//Tell us when the route is being called
router.use(function (req, res, next) {
    // do logging
    res.header("Access-Control-Allow-Credentials", "true")
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/hegels')  //Post or get the data to the mongodb database

    .post(function (req, res) {

        //Get the findlays from the route;
        var findlay_url = 'http://localhost:3030/findlay'

        //This is the Table of Contents page for the Phenomenology
        url = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';

        var alldata = [];
        findlay.get_findlay(findlay_url).then(function (data) {
            try {
                data = JSON.parse(data);
            } catch (ex) {
                console.log(ex);
            }
            alldata.push(data);
        })

        scraper.get_toc(url)  //Get the TOC from url
            .then(function (data) {
                return scraper.get_links(data);   //Get all the links from the TOC
            })
            .then(function (data) {
                return scraper.get_multiple(data); //Get all of the pages from the links
            })
            .then(function (data) {
                return eng.get_multiple_english(data);  //Parse all of the data into an object
            })
            .then(function (data) {

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

    .get(function (req, res) {
        Hegel.find(function (err, hegels) {
            if (err)
                res.send(err);
            res.json(hegels);
        });
    });

//Find a single ID in the mongodb database
router.route('/hegels/:id')

    .get(function (req, res) {

        var id = Number(req.params.id);
        console.log("Getting: " + id);

        Hegel.findOne({ 'number': id }, function (err, hegel) {
            if (err) {
                console.log(err);
            }
            var words = [];
            words[0] = [];

            try {

                hegel.hegel.text.forEach(function (one) {
                    words[0].push(one);
                })
            } catch (ex) {
                console.log(ex);
            }
            words[0].forEach(function (one, index) {
                words[index] = tokenizer.tokenize(one);
            })

            res.send(words);
        })
    });

router.route('/hegels/findlay/:id')

    .get(function (req, res) {

        var id = Number(req.params.id);
        console.log("Getting: " + id);

        Hegel.findOne({ 'number': id }, function (err, hegel) {
            if (err) {
                console.log(err);
            }
            var words = [];
            words[0] = [];

            try {
                hegel.findlay.text.forEach(function (one) {
                    words[0].push(one);
                })
            } catch (ex) {
                console.log(ex);
                res.send('');
            }
            words[0].forEach(function (one, index) {
                words[index] = tokenizer.tokenize(one);
            })

            res.send(words[0]);
        })
    });

//Get a single word from the Wordnet Database
router.route('/hegels/word/:word')
    .get(function (req, res) {
        var word = req.params.word;

        natty.getToken(word).then(function (data) {
            console.log(data);
            res.send(data);
        });
    });


var wikiQuery = [];
//Route for Wikipedia Queries
router.route('/wiki/:query')
    .get(function (req, res) {

        var query = req.params.query;

        var wiki = new Wiki();
        natty.getToken(query).then(function (data) {
            // wikiQuery.push({dictionaries: data});
            ee.emit("wikEvent", { dictionaries: data });
        });
        queryTerm(query);
        res.send({ done: "Done" })

        function queryTerm(query) {
            wiki.page(query).then(function (links) {
                links.links().then(function (links) {
                    var linkObj = { links: links };
                    linkObj.word = { word: query };
                    ee.emit("wikEvent", linkObj);
                });
            });

            wiki.page(query).then(function (pages) {
                pages.categories().then(function (info) {

                    var infoParse = info.filter(function (infos) {
                        if (infos == "Category:All disambiguation pages"
                            || infos == "Category:Redirects from surnames"
                            || infos == "Category:Surnames") {
                            return infos;
                        };
                    });

                    if (infoParse.length > 0) {
                        var infoParseObj = { categories: infoParse };
                        ee.emit("wikEvent", infoParseObj);
                    }

                    if (infoParse.length == 0) {
                        var infoObj = { categories: info };
                        ee.emit("wikEvent", infoObj);
                    }

                    if (infoParse.length > 0) {
                        wiki.page(query).then(function (pages) {
                            pages.html().then(function (content) {
                                var $ = cheerio.load(content);
                                $('.mw-editsection').remove();
                                $('#toc').remove();

                                var parsedHtml = { page: $.html() };

                                ee.emit("wikEvent", parsedHtml);
                                var $ = cheerio.load(content);
                                var a = $('a');
                                var results = [];
                                a.each(function () {
                                    var a = $(this);
                                    results.push(a.text());
                                });
                                var page = { results: results };
                                ee.emit("wikEvent", page);

                            });
                        });
                    } else {
                        console.log("Giving you the full monty");
                        wiki.page(query).then(function (pages) {
                            pages.html().then(function (page) {
                                var $ = cheerio.load(page);
                                $('.metadata').remove();
                                $('#toc').remove();

                                $('.mw-editsection').remove();
                                var parsePage = { page: $.html() }
                                parsePage.word = query;
                                ee.emit("wikEvent", parsePage);
                            });
                        });
                    }
                });
            });
        }

        function queryArray(arr) {
            arr.forEach(function (query) {
                wiki.page(query).then(function (pages) {
                    pages.categories().then(function (info) {
                        console.log("------------------------------");
                        console.log(info);
                        console.log("------------------------------");
                        info = info.filter(function (infos) {
                            if (infos == "Category:All disambiguation pages"
                                || infos == "Category:Redirects from surnames"
                                || infos == "Category:Surnames") {
                                return infos;
                            };
                        });
                        wikiQuery.push(info)
                        ee.emit("wikEvent", wikiQuery);
                        if (info.length > 0) {
                            console.log("Info warrior");
                            wiki.page(query).then(function (pages) {
                                pages.html().then(function (content) {
                                    var $ = cheerio.load(content);
                                    var a = $('a');
                                    var results = [];
                                    a.each(function () {
                                        var a = $(this);
                                        console.log("------------------------------");
                                        console.log(a.text());
                                        console.log("------------------------------");
                                        results.push(a.text());
                                    });
                                    wikiQuery.push(results)
                                    ee.emit("wikEvent", wikiQuery);
                                });
                            });
                        } else {
                            wiki.page(query).then(function (pages) {
                                pages.html().then(function (info) {
                                    wikiQuery.push(info);
                                    ee.emit("wikEvent", wikiQuery);
                                });
                            });
                        }
                    });
                });
            })
        }
    });

app.get('/german', function (req, res) {
    german.get_german('https://www.marxists.org/deutsch/philosophie/hegel/phaenom/kap1.htm#p90')
        .then(function (data) {
            data = german.scrape_german(data);
            res.send(data);
        })
})

app.get('/findlay', function (req, res) {
    findlay.make_links().then(function (data) {
        return findlay.get_multiple(data);
    })
        .then(function (data) {
            return findlay.scrape_multiple(data);
        })
        .then(function (data) {
            res.send(data);
        })
})

//Table of contents -- the post route is the scraper
router.route('/toc')
    .get(function (req, res) {
        Toc.find().then(function (data) {
            res.send(data[0].table);
        })
    })
    .post(function (req, res) {
        //This is the Table of Contents page for the Phenomenology
        var contents = 'https://www.marxists.org/reference/archive/hegel/works/ph/phconten.htm';
        scraper.get_toc(contents)

            .then(function (data) {
                return scraper.get_links(data); //Get all of the links contained
            })
            .then(function (data) {
                //Remove duplicate links from all of the toc links (There are many!);
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

            .then(function (data) {
                return scraper.get_multiple(data);
            })

            .then(function (data) {

                var allofem = scraper.getallofem(data); // make an array of headings from each page
                var Chapter = scraper.Chapter; // refer to the chapter prototype
                var table = scraper.convert_to_obj(allofem, Chapter) //convert the scraped array to an object
                table = scraper.nest_chapters(table); //Nest subchapters in chapters

                //Get only unique elements in the table with underscore.
                table = _.uniq(table, function (item, key, title) {
                    return item.title;
                })

                //Set the bounds of each chapter to be the highest/lowest sections
                table = scraper.set_bounds(table);

                try {  //Try saving to the mongodb
                    var toc = new Toc({ table: table });
                    toc.save();
                } catch (ex) { console.log(ex) }

                res.send(table);
            })
    });

app.use('/api', router);

var server = app.listen(3050, function () {
    var address = server.address().address
    var host = (address === '::' ? 'localhost' : address);
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server, { origins: 'http://localhost:5555', 'transports': ['xhr-polling', 'polling', 'websocket', 'flashsocket'] });
server.listen(3030);

io.on('connection', function (socket) {
    ee.on("wikEvent", function (info) {
        console.log("Sending", info.word);
        if (info !== undefined) {
            socket.emit('wikiSend', info);
        }
    });

    socket.on('received', function (data, fn) {
        var msg = data.msg[0];
        try {
            wikiQuery = _.remove(wikiQuery, function (orig) {
                return orig === data;
            });
        } catch (ex) {
            console.log(ex);
        };
    });
});

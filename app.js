var express = require('express');
var app = express();
var cheerio = require('cheerio');
var request = require('request');
var Promise = require('promise');
var async = require('async');
var natural = require('natural');
var Gutenberg = require('gutenberg');
var instance  = new Gutenberg();
var wordnet = new natural.WordNet();
var tokenizer = new natural.WordTokenizer();
var bodyParser = require('body-parser');
var fs  = require('fs');
var natty = require('./site/js/natural.js');
var mongoose = require('mongoose');
var eng = require('./site/js/eng.js');
var Hegel = require('./site/js/bear.js');

app.use(express.static('site'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

mongoose.connect('mongodb://jeff:duomaximum01@ds035683.mongolab.com:35683/hegeltest');

var router = express.Router();
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/hegels')
    .post(function(req, res) {

        eng.getit('https://www.marxists.org/reference/archive/hegel/works/ph/phaa.htm').
            then(function(data){
                var data = eng.get_data(data);

                data.forEach(function(one){
                    var hegel = new Hegel();
                    hegel.id = one.id;
                    hegel.text = one.paragraph[0];
                    hegel.type = one.type;

                    hegel.save(function(err){});
                })

            });
    })
    .get(function(req, res) {
        Hegel.find(function(err, hegels) {
            if (err)
                res.send(err);

            res.json(hegels);
        });
    });

router.route('/hegels/:id')

    .get(function(req, res) {
        var id = req.params.id;
        console.log(id);
        Hegel.findOne({id:id}, function(err, hegel ){
            if(err){
                console.log(err)
            }
            var words = [];
            words[0]  = hegel.text.toString();
            words[0] = tokenizer.tokenize(words[0]);

            /*natty.lookupmultiple(words[0]).then(function(data){
                words[1] = data;

                })*/
            res.send(words);
            
        })
    });

router.route('/hegels/word/:word')
    .get( function(req , res ) {
        var word = req.params.word;
        natty.getToken(word).then(function(data){
            console.log(data);
            res.send(data);
        })
    })


    app.get('/natural' , function(req, res){
        var words;
        request('http://localhost:3000/api/hegels', function (error, response, body) {
            body = JSON.parse(body);
            body.forEach(function(one){
                words= one.text.toString();
                words = tokenizer.tokenize(words);
                res.send(words);
            })
//            natty.lookupmultiple(words).then(function(data){
  //              res.send(data);
    //        })
        });
});

app.get('/english' , function(req, res){
    eng.getit('https://www.marxists.org/reference/archive/hegel/works/ph/phaa.htm').
        then(function(data){
            var data = eng.get_data(data);
            res.send(data);
        });
});

app.get('/findlay' , function(req, res){
    function parse(url) {
        var content;

        request(url, function (error, response, body) {
            if (!error){
                var
                $ = cheerio.load(body);
                //Findlay Function
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
                    res.send(findlay_array);
                    }
        })
    }
    parse('https://www.marxists.org/reference/archive/hegel/help/findlay1.htm#m090');
});



app.get('/german' , function(req, res){

    function parse(url) {
        var content;

        request(url, function (error, response, body) {
            if (!error){
                var
                $ = cheerio.load(body);

                var german = return_german_obj($('body'));

                function return_german_obj(german){
                    var all = [];
                    var p = german.find('p');
                    p.each(function(){
                        var id; var text;
                        var item = {id: "" , text: ""};
                        console.log($(this));
                        var cur_p = $(this);
                        var aa = cur_p.find('a');

                        aa.each(function(){
                            var a = $(this);
                            var germ_reg = /p\d\d/ || /p\d\d\d/;

                            if (germ_reg.test( a.attr('id'))){
                                var id  = a.attr('id');
                                id = id.slice(1,4) || id.slice(1,3) || id.slice(1,2);
                                var german_text = a.parent().text();
                                item.id = id;
                                item.text = german_text;
                                all.push(item);
                            }
                        })
                            })
                        return all;
                }
                res.send(german);
            }
        })
    }
    parse('https://www.marxists.org/deutsch/philosophie/hegel/phaenom/kap1.htm#p90');
});

app.get('/scrape', function(req, res){

    url =  'http://gutenberg.readingroo.ms/2/5/5/5/25551/25551-8.txt';

    request(url, function(error, response, html){
        if(!error){
            var content = "";
            instance._ContentParseRecord( html , function(err, result){
                content =  result.content;
            });

            function escapeRegExp(str) {
                return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            }
            function replaceAll(str, find, replace) {
                return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
            }
           content = replaceAll(content, '\r\n\r\n' , '</p><p>' );
        res.send (content);
        }
    })
})
app.use('/api' , router);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

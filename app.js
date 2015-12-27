var express = require('express');
var app = express();
var Gutenberg = require('gutenberg');
var instance = new Gutenberg({});
var cheerio = require('cheerio');
var request = require('request');
var content;
app.use(express.static('site'));

app.get('/english' , function(req, res){
    function parse(url) {
        var content;

        request(url, function (error, response, body) {
            if (!error){
            var
                $ = cheerio.load(body);

                remove_empty_p();
                function remove_empty_p(){
                    $('p').each(function() {
                        var $this = $(this);
                        if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
                            $this.remove();
                    });
                }

                var arr = make_object();
                res.send(arr);

                function make_object(){
                    var english_array = [];

                    var p  = $('body').find('p');

                    p.each(function(){

                        var id , text , type , paragraph;

                        var json =
                            { type: "english", id : "" , text: "" , section: "", paragraph : []};

                        var p  = $(this);
                        var paragraph= [];
                        if (p.find('span.point1').text()){


                            var text = p.find('span.point1');
                            var id = text.find('a').next().text();
                            json.id = id;

                            var first_text = p.find('span.point1').parent().text();
                            text = text.find('a').next().text();
                            paragraph.push(first_text);

                            var next = p.next('p');
                            if (next.find('span.point1').text() == ""){
                                var next_text = next.text();
                                paragraph.push(next_text);
                            }
                            json.paragraph = paragraph;
                            english_array.push(json);
                        }

                    })
                        return english_array;
                }
            }
        })
    }
    parse('https://www.marxists.org/reference/archive/hegel/works/ph/phaa.htm');
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


var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

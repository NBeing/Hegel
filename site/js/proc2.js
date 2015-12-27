(function($) {
    $.fn.changeElementType = function(newType) {
        var attrs = {};

        $.each(this[0].attributes, function(idx, attr) {
            attrs[attr.nodeName] = attr.nodeValue;
        });

        this.replaceWith(function() {
            return $("<" + newType + "/>", attrs).append($(this).contents());
        });
    };
})(jQuery);

$(document).ready( function () {

    //To do
    // Clean up Findlay
    //Figure out 'all together' function
    //make it so all data is in an object before displaying
    //Add_p function makes you lose tags fix
    //Make it so that there are 3 separate parses which populate the database
    //   Then these will be made to a view (More MVC)
        //-- All of these scraping functions really should be on the server
    //Make sure these three are as 'functional' as possible
    // *** Parse headings in an intelligent way
    //integrate endnotes

    var english  = $('#english');
    var german = $('#german');

    var p = $('p'); // Make this get all of the elements maybe? 
    var reg_eng = /m\d\d\d/;
    var reg_ger = /p\d\d\d/; //Make a wildcard in this regexp

    remove_headers(english);
    var footnotes = find_footnotes(english);
    add_section_tags_english(english);
    var headings = find_heading(english , 'h3');

    cleanup(english, 'a');
    cleanup(english, 'span');
    remove_empty_p();

    add_p(english);
    concat_section(english);

    $('body').append("<div id = 'neweng'></div>");
    var ang = make_json_eng(english);
    eng_json_to_html(ang);

    var germy = return_german_obj(german);
    print(ang);
    function print(object){
        var data = object;
        data = JSON.stringify(data);
        console.log(data);

        /* for ( var i = 0 ; i < data.length ; i++){
            var sect;
            sect = data[i][0];
            for ( var  j = 0 ; j < data[i][1].length ; j++ ) {
                var id = data[i][1][j].id;
                var count = data[i][1][j].count;
                var text = data[i][1][j].text;
            }
        } */

    }
    german_to_html(germy);
    match_german();

    return_findlay_obj();
    place_headings(headings);
    place_footnotes(footnotes , $('#neweng'));
    //$('#english').remove();
    //var tex = $('#foot').text();
    //var sents =  break_to_sentences(tex);
    //to_paragraph(sents);

    find_h3($('#neweng'));
    $('#english').remove();
    function find_h3 (section){
        var sect = section;
        var hthree = sect.find('h3');
        hthree.each(function(){
            var found = 0;
            var next = $(this).next('h3');
            var prev = next.prev('section');

            if ( next.prev().attr('id')){
                console.log (next.prev('section'));}
          /*  do {
                // look at the item and see if its an h3
                if(next.is('h3')){
                    found = 1;
                    console.log(next);
                }//if the item is not an h3 then make next = to the next item
                else{next= next.next()}
            }
            while ( found === 0 );*/
        })
            }

    function to_paragraph(sentences){
        var sent = sentences;

        for ( var i = 0 ; i < sent.length; i++){
            console.log(sent[i]);
        }
    }
    function break_to_sentences(paragraph){
        var text = paragraph;
        var sentences = text.match( /[^\.!\?]+[\.!\?]+/g );
        return sentences;
    }

    function place_footnotes(footnotes , appendto){
        var foots = footnotes;
        appendto.append("<footer></footer");
        for ( var i = 0 ; i < foots.length; i++){
            $('footer').append("<div footnote ='" +foots[i].num + "'>" + foots[i].text + "</div>");
        }
    }
    function place_headings(headings){
        var head = headings;
        for ( var i = 0 ; i < head.length; i++){
            var place = headings[i].next;
            $("<h3>" + headings[i].text + "</h3>").insertBefore('section#' +place);
           // $('section#' + place).append("<h3>" + headings[i].text + "</h3>");
        }
    }


    function find_footnotes (section){
        var sect = section;
        section.append("<footer> </footer>");
        sect =  section.find('a');
        var notes = [];
        sect.each(function(){
            var name = $(this).attr('name');
            var reg = /N\_\d\_/;
            if (reg.test(name)){
                var note = {};
                name = name.substring(2,3);
                var orig_note = $(this).parent();
                var text = orig_note.text();
                var num = name;
                orig_note.remove();

                note.num = num;
                note.text = text;
                notes.push(note);
            }
        })
            return notes;
    }
    function remove_headers(section){
        var sect = section;

        sect.find('meta').each(function(){
            $(this).remove();
        })
            sect.find('link').each(function(){
                $(this).remove();
            })

                sect.find('title').each(function(){
                    $(this).remove();
                })

    }
    function find_heading(section , elm){ //should the input just be a number instead of a string (use this info to hierarchize)
        var elm = elm;
        var sect = section;
        var find = sect.find(elm);
        var headings = [];
        find.each(function(){
            var heading = {};
            heading.text = $(this).text();
            var next = $(this).next();
            if(next.attr('section')){
                heading.next = next.attr('section');
                console.log(heading.next);
            }
            headings.push(heading);
        })
            return headings;
            }

    function add_section_tags_english(english){
        var p = english.find('p');
        p.each(function(){
            var pp = $(this);
            var id = pp.find('a').attr('name');
            var span = pp.find('span');
            var aa = pp.find('a');

            span.each(function(){
                var span = $(this);
                var as  = span.find('a');
                var a_arr = as.each(function(){
                    var a = $(this);
                    var num = /\d\d/ || /\d\d\d/;
                    if (num.test ( a.text())){
                        var parent = a.parent().parent();
                        parent.attr('section', a.text());
                        parent.changeElementType('section');
                    }
                });
            })
                })
            }

    function german_to_html(germy){
        for (key in germy){
            $('#german').append('<p class ="german" section = "'+ key + '">' + germy[key]+ '</p>')
        }
    }

    function all_together(german, english , findlay){
        //get all of the objects here and put them into a more coherent object
    }

    function match_german(german){
        var germans = $('p.german');
        var finding = $('#neweng').find('section');
        germans.each(function(){
            var item = $(this);
            var id = $(this).attr('section');
            finding.each(function(){

                if ($(this).attr('id') === id){

                    $(this).append(item);
                }
            })
                })
            $('#german').remove();
            }

    function return_findlay_obj(){
        var text = {};
        var findlays = $('#findlay').find('a');
        var finding = $('#neweng').find('section');

        findlays.each(function(){
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
                    $(this).addClass('findlay');
                    $(this).attr('section', name);
                })
                finding.each(function(){
                    if ($(this).attr('id') === name){
                        $(this).append(next);
                    }
                })
            };
        })
            finding.each(function(){
                var spans =  $(this).find('span.point1');
                spans.each(function(){
                    $(this).remove();
                })
            })
            $('#findlay').remove();
    }
    function return_german_obj(german){
        var text = {};
        var p = german.find('p');
        p.each(function(){
            var cur_p = $(this);
            var aa = cur_p.find('a');

            aa.each(function(){
                var a = $(this);
                var germ_reg = /p\d\d/ || /p\d\d\d/;

                if (germ_reg.test( a.attr('id'))){
                    var id  = a.attr('id');
                    id = id.slice(1,4) || id.slice(1,3) || id.slice(1,2);
                    var german_text = a.parent().text();
                    text[id] = german_text;
                }
            })
                })
            return text;
    }


    function parse_eng(english){
        var engy = english;
        var eng = {};
        engy.each(function(){
            var cur = $(this);
            if ( cur.attr('name')){
                eng[cur.attr('name')] = cur;
            }
        })
            return eng;

    }

    function cleanup(data , type){
        var list = data;
        var elem = type;

        list.each(function(){
            var section = $(this);
            var find = section.find(elem);
            find.each(function(){
               $(this).detach();//use regexp to remove these because you might remove authentic links
            })
                })
            }


    function add_p(sections){
        var sect = sections.find('section');
        sect.each(function(){
            var text = $(this).text();
            var wrapped = "<p>" + text + "</p>";
            $(this).text("");
            $(this).append(wrapped);
        })
    }
    function concat_section(data){
        var sections = data.find('section');

        sections.each(function(){
            var section = $(this);
            var id = section.attr('section');

            if(!(section.next().attr('section'))){
                var text = section.next().text();
                var append = section.next().detach();
                section.append("<p>"+ text + "</p>");
            }
        })
            }

    function remove_empty_p(){
    $('p').each(function() {
        var $this = $(this);
        if($this.html().replace(/\s|&nbsp;/g, '').length == 0)
            $this.remove();
    });
    }

    function eng_json_to_html(data){
        var data = data;

        for ( var i = 0 ; i < data.length ; i++){
            var sect;
            sect = data[i][0];
            $('#neweng').append("<section id ='" + sect + "'></section>");
            $('#neweng > #'+sect).prepend("<h4>" + sect + "</h4>");
            for ( var  j = 0 ; j < data[i][1].length ; j++ ) {
                var id = data[i][1][j].id;
                var count = data[i][1][j].count;
                var text = data[i][1][j].text;
                $('#neweng > #'+id).append("<p class = 'english' section = '" + sect + "' subsection = '" + count + "'>" + text + "</p>");
            }
          }
        }


    function make_json_eng(english){
        var eng = english.children();
        var all = [];
        eng.each(function(){

            var cur = $(this);
            var count = 0;

            var is_num = /\d\d/ || /\d\d\d/;
            if (is_num.test( cur.attr('section' ))) {
                var id = cur.attr('section');
                var pees = cur.find('p');
                var some = [];

                pees.each(function(){
                    var p = $(this);
                    var text = p.text();
                    for ( var i = 0 ; i < some.length ; i++){
                        if(some[i].id === id){
                            count += 1;
                        }
                        else { count = 0;
                               some = [];
                             }
                    }
                    var para = {};

                    para.id = id;
                    para.count = count;
                    para.text = text;
                    some.push(para);
                })
                    all.push([id ,some]);
                    }
        })

             return all;
    }
});

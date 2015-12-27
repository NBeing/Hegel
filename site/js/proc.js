$(document).ready( function () {

    var re = /point\d/;
    var re2 = /m\d\d\d/;

    var spans = $('span');

    spans.each(function(){
        var  id = $(this).attr('class');
        if ( re.test(id) ){
            var par  = $(this).parent();
            var a = par.find('a');

            a.each(function(){
                var id = $(this).attr('name');
                if(re2.test(id)){
                    id = id.slice(1,4);
                }
                $(this).removeAttr('name');
                $(this).attr('class',id);
                var next = $(this).next();
                next.attr('class',id);
                var parent = next.parent('p');
                parent.attr('class', id);
                parent.addClass('section');
                var correlate = $(this).next().children('a');

                correlate.each(function(){
                    $(this).attr('class', id);
                })
            })
                };

    })
        var sections = $('p.section');

    var german = $('#german').children('p');
    var english = $('#cheer').children('p');

    german.each(function(){
        var a =  $(this).children('a');

        a.each(function () {
            console.log($(this));
            var idee = $(this).attr('id');
            console.log("Type is " + typeof(idee));

            if ( typeof(idee) == 'string'){

                idee = idee.slice(1,4) || idee.slice(1,3) || idee.slice(1,2);
                if (idee.length < 3){
                    idee = "0" + idee;
                }
                $(this).parent().addClass(idee);
                $(this).append("<span class = 'number'>" + idee + "<span>" +  " ");
                var parens = $(this).parent();

                sections.each(function(){
                    var section = $(this);
                    section.addClass('section');
                    if( section.attr('class') && section.hasClass(idee)){
                        console.log("firedd" + idee);
                        var germ = parens.detach();
                        germ.appendTo(section);
                        germ.addClass('german');
                    }
                });

            }

        });

    })

    english.each(function(){
        var a  = $(this).children('a');
         a.each(function(){
            var id = $(this).attr('id');
            var s = $(this).parent().children('a');
        })
    })
})

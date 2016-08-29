
app.factory('findlayFactory' , function ($http){
    var factory = {};
    factory.getFindlays = function(){
        return $http.get('http://localhost:3020/findlay')
    }
    factory.getIndFindlay = function(num){
        return $http.get('http://localhost:3020/api/hegels/findlay/' + num.toString())
    }
    return factory;
})

app.factory('tocFactory' , function ($http){

    var factory = {};

    factory.getToc = function(){
        console.log('getting TOC');
        return $http.get('http://localhost:3020/api/toc')
    }

    factory.State = function State( cursor , chapter ) {
        this.cursor = cursor || 1;
        this.chapter = chapter || 'PREFACE\nOn scientific knowledge';
    }
    
    factory.findchapter = function (toc , number){
        var result;
        console.log("finding : " + number)
        toc.forEach(function(chapter){              

        if(chapter.subsections.length >  0 ){  //if it has subsections
            console.log('has subsections ... ')

            chapter.subsections.forEach(function(subsection){ 
                console.log(subsection)
                if(subsection == number){ 
                    result = chapter.title;
                }
            })
        }
        if(chapter.subchapters.length > 0){ //if it has subchapters
            console.log('has subchapters... ')
            chapter.subchapters.forEach(function(subsub){
                console.log(subsub.title);
                subsub.subsections.forEach(function(subsects){
//                    console.log(subsects);
                    if(subsects == number){
                        result = chapter.title;
                    }
                })
            })
        }
    })
        return result;
    }

factory.show = function show (the_state , title ){
    console.log("looking for : " + title)
    var chap_title = $('h1.title');
    chap_title.each(function(){
        if($(this).text().trim() == title){
            console.log("found")
            $(this).parent().parent().show(500);
        }
    })
}
    factory.increment = function increment( the_state , $scope ){  //just pass the scope dawg
        if (the_state.cursor + 1 > the_state.bounds.upper){
            console.log('changed section');
                //go to the next section
                //first find next chapter
                $scope.changechapter(the_state , 1 );
                the_state.cursor = the_state.cursor + 1;
                
            } else {
                the_state.cursor = the_state.cursor + 1; 
            }
        }
        factory.decrement = function decrement( the_state , $scope ){

            if (the_state.cursor - 1 < the_state.bounds.lower){
                if(the_state.cursor - 1 <= 0 ){

                }else{
                    console.log('changed section');
                    //go to the next section
                    //first find next chapter
                    $scope.changechapter(the_state , -1 );
                    the_state.cursor = the_state.cursor-1;
                }
            } else {
                the_state.cursor = the_state.cursor - 1; 
            }
        }
        factory.getit =  function getit (num , $scope){
            $scope.getInd(num).success(function(data){
                return data;
            })
            .then(function(data){
                $scope.ind = data.data[0];
            })
        }


        factory.find_section = function find_section(count , sections){
            console.log("count is : " + count)
            sections.each(function(index){
                $(this).removeClass('focus');

                if( $(this).text().trim() == count){
                    $(this).addClass('focus');

                }
            })                  
        }
        return factory;
    })

app.factory('englishFactory' , function ($http){
    var factory = {};
    factory.getEnglish = function(){
        return $http.get('http://localhost:3020/english')
    }
    return factory;
})

app.factory('scrapeFactory' , function ($http){
    var factory = {};
    factory.getScraper = function(){
        return $http.get('http://localhost:3020/scraper')
    }
    return factory;
})
app.factory('germanFactory' , function ($http){
    var factory = {};
    factory.getGerman = function(){
        return $http.get('http://localhost:3020/german')
    }
    return factory;
})


app.factory('naturalFactory' , function ($http){
    var factory = {};
    factory.getInd = function (ind){
        return $http.get('http://localhost:3020/api/hegels/'+ ind.toString());
    }
    factory.getIndWord = function (word){
        return $http.get('http://localhost:3020/api/hegels/word/'+ word);
    }

    return factory;
});


app.factory('wikiFactory' , function ($http){
    var factory = {};

    factory.getWiki = function (word){
        return $http.get('http://localhost:3020/api/wiki/' + word.toString());
    }
    return factory;
});

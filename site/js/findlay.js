app.controller('FindlayController' , function ($scope , findlayFactory, englishFactory, germanFactory){

    function init(){
        $scope.master = [];

        findlayFactory.getFindlays().success(function(data){
            $scope.master.push(data);
        })
            .success(function(){
                germanFactory.getGerman().success(function(data){
                    $scope.master.push(data);
                    console.log(data);
                })
            })

            .success(function(){
            englishFactory.getEnglish().success(function(data){
                $scope.master.push(data);
                $scope.master = $scope.pair($scope.master);
            })
        })

        $scope.pair = function(mast){
            var english , findlay , german ;
            var all = [];
            for(var item in mast[2]){
                var master = {id : {english: {} , findlay: {} , german:{}} };
                var id = mast[2][item].id;
                master.id = id;
                master.english = mast[2][item];
                for( var item in mast[0]){
                    if (mast[0][item].id === id){
                        master.findlay = mast[0][item];
                        for(var item in mast[1]){
                            if(mast[1][item].id === id){
                                master.german = mast[1][item];
                                all.push(master);
                            }
                       }
                    }
                }
            }
            return all;
        }

        $scope.getID = function(value) {
            var data = $scope.findlays;
            for(var key in data){
                if (data[key].id == value){
                  //  console.log(data[key].id);
            };
            }
        }
    }
    init();
})


app.controller('NaturalController' , [ '$scope', '$sce' , 'naturalFactory','englishFactory', 'wikiFactory', function ($scope , $sce, naturalFactory, englishFactory , wikiFactory){

    $scope.hi = function(){
        var span = $('span');

        span.click(function(){
            togglefocus($(this));
        })

    $(document).unbind('keyup').bind('keyup', function (e) {
            if(event.which == 69 ){
                $scope.section = $scope.section + 1;
                $scope.getit($scope.section);
            }

            if(event.which == 87){
                $scope.wikis();
            }
                  if(event.which == 65){
                $scope.print();
            }
             if(event.which == 88 ){
                span.each(function(){
                $(this).removeClass('focus');
            })
            }
                if(event.which == 81 ){
                $scope.section = $scope.section - 1;
                $scope.getit($scope.section);
            }

            if(event.which == 39 ){ //right arrow
                var cur  = $('span.focus');
                span.each(function(){
                $(this).removeClass('focus');
                cur.next().addClass('focus');
            })                
            }

             if(event.which == 37 ){ //right arrow
                var cur  = $('span.focus');
                span.each(function(){
                $(this).removeClass('focus');
                cur.prev().addClass('focus');
            })                
            }
});

setTimeout(function(){
         $('div.ind_section > p > span').first().addClass('focus');
        }
    , 500);

    function togglefocus(el){
            var focus = el;
            if(focus.hasClass('focus')){
                focus.removeClass('focus')
            }
            else{
                focus.addClass('focus');
            }
        }
    }

    $scope.wikis = function(){
            var focus = $('.focus');

            focus.each(function(){
                $scope.wword = $(this).text();
                $scope.wiki($scope.wword);
            })
    }
    $scope.print = function(){
            var focus = $('.focus');

            focus.each(function(){
                $scope.wordy = $(this).text();
                $scope.wordget($scope.wordy);
            })
        }
    $scope.getit = function(num){
        $scope.getInd(num).success(function(data){
            return data;
        }).then(function(data){
            $scope.ind = data.data[0];
            $scope.$watch('ind', function(newval ,oldval){
                $scope.hi();
            })

      })
    }

    $scope.wordget = function(word){
        $scope.getIndWord(word).success(function(data){
            $scope.wordy = data;
        })
    }
    $scope.renderHtml = function(html_code){
            return $sce.trustAsHtml(html_code);
    }

    $scope.wiki = function(word){
        $scope.getWiki(word).success(function(data){

            $scope.wword = $scope.renderHtml(data);
        })
    }
    function init(){
        $scope.section = 91;
        $scope.initial_word = 'hegel';
        $scope.getInd = naturalFactory.getInd;
        $scope.getWiki = wikiFactory.getWiki;
        $scope.getIndWord = naturalFactory.getIndWord;
        $scope.wordy = "Ball";
        $scope.getit($scope.section);
        $scope.wordget($scope.wordy);

        $scope.wiki($scope.initial_word);

      
        $scope.hi();
    }
    init();
}]);

app.factory('findlayFactory' , function ($http){
    var factory = {};
    factory.getFindlays = function(){
        return $http.get('http://localhost:3000/findlay')
    }
    return factory;
})

app.factory('englishFactory' , function ($http){
    var factory = {};
    factory.getEnglish = function(){
        return $http.get('http://localhost:3000/english')
    }
    return factory;
})

app.factory('germanFactory' , function ($http){
    var factory = {};
    factory.getGerman = function(){
        return $http.get('http://localhost:3000/german')
    }
    return factory;
})


app.factory('naturalFactory' , function ($http){
    var factory = {};
    factory.getInd = function (ind){
        return $http.get('http://localhost:3000/api/hegels/'+ ind.toString());
    }
    factory.getIndWord = function (word){
        return $http.get('http://localhost:3000/api/hegels/word/'+ word);
    }


    return factory;
});


app.factory('wikiFactory' , function ($http){
    var factory = {};

    factory.getWiki = function (word){
        return $http.get('http://localhost:3000/api/wiki/' + word.toString());
    }
    return factory;
});
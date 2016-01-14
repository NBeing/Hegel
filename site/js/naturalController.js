
app.controller('NaturalController' , [ '$scope', '$sce' , 'naturalFactory','englishFactory', 'wikiFactory', 'findlayFactory', 'scrapeFactory', function ($scope , $sce, naturalFactory, englishFactory , wikiFactory, findlayFactory, scrapeFactory){
    
    //You should split this controller into other controllers in order to make your code more modular (wikiController, findlayController, wordnetController, englishController etc).

    $scope.loadControls = function(){  //Load in UI
        $(document).unbind('keyup').bind('keyup', function (e) {
             var span = $('span');
             
             if(event.which == 72){
                $('#help').toggle();
             }
            if(event.which == 70){
                if($scope.state == false){
                    $('.findlay').toggle();
                    $('.ind_section').width('40%');
                
                    $scope.state = true; 
                }
                else{
                    console.log('fire true');
                    $('.findlay').toggle();
                       $('.ind_section').width('60%');
                    $scope.state = false;
                }
            }
            if(event.which == 81 ){
                $scope.section = $scope.section - 1;
                $scope.getit($scope.section);
                $scope.getIndFind($scope.finds , $scope.section)
            }
            if(event.which == 69 ){
                $scope.section = $scope.section + 1;
                $scope.getit($scope.section);
                $scope.getIndFind($scope.finds , $scope.section)

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
}


    $scope.hi = function(){

        var span = $('span');

        span.click(function(){
            togglefocus($(this));
        })
    
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
        $scope.getIndFind = function(data, num){
        for(var t = 0; t < data.length; t++){
            if(data[t].id == num){
                $scope.find = data[t].text;
            }
        }
    }

    function init(){
        $scope.state = false;
        $scope.findlays = findlayFactory.getFindlays;
        $scope.section = 91;
        $scope.initial_word = 'hegel';
        $scope.getInd = naturalFactory.getInd;
        $scope.getWiki = wikiFactory.getWiki;
        $scope.getIndWord = naturalFactory.getIndWord;
        $scope.wordy = "Ball";
        $scope.getit($scope.section);
        $scope.wordget($scope.wordy);
        $scope.loadControls();
        $scope.wiki($scope.initial_word);
        $scope.hi();

        $scope.getScraper = scrapeFactory.getScraper;
        $scope.getScraper().success(function(data){
            $scope.scrape = data;
        });
        $scope.findlays().success(function(data){
            $scope.finds = data;
        }).then(function(){
            $scope.getIndFind($scope.finds, $scope.section);
        })

    }
    init();
}]);

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


app.controller('NaturalController' , function ($scope , naturalFactory, englishFactory ){
    

    $scope.getit = function(num){
        $scope.getInd(num).success(function(data){
            $scope.ind = data[0];
        })
    }

    $scope.wordget = function(word){
        $scope.getIndWord(word).success(function(data){
            $scope.wordy = data;
        })
    }
    function init(){
        $scope.section = 91;
        $scope.getInd = naturalFactory.getInd;
        $scope.getIndWord = naturalFactory.getIndWord;
        $scope.wordy = "Ball";
        $scope.getit($scope.section);
        $scope.wordget($scope.wordy);

    }
    init();
});

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
})

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

app.controller('NaturalRefactorController' , function ($scope , naturalreFactory, englishFactory ){
    function init(){
         naturalreFactory.getNatural().success(function(data){ 
                $scope.words = data;

        })
    }


    init();
});

app.controller('NaturalController' , function ($scope , naturalFactory, englishFactory ){
    function init(){
         naturalFactory.getNatural().success(function(data){ 
                $scope.words =data;

        })
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
    factory.getNatural = function(){
        return $http.get('http://localhost:3000/natural')
    }
    return factory;
})

app.factory('naturalreFactory' , function ($http){
    var factory = {};
    factory.getNatural = function(){
        return $http.get('http://localhost:3000/naturalrefactor')
    }
    return factory;
})

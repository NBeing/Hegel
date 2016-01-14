
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
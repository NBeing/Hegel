var app  = angular.module('customersApp' , ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when('/',
                        {controller: 'FindlayController',
                         templateUrl: '/views/hegel.html'
                        })
/*        .when('/orders',
              {controller: 'OrdersController',
               templateUrl: '/views/orders.html'
              }) */
});

app.controller('CustomerController' , function ($scope ,customersFactory){

    function init(){
        customersFactory.getCustomers().success(function(data){
            $scope.customers = data;
        })
    }
    init();
})

app.factory('customersFactory' , function ($http){
    var factory = {};
    factory.getCustomers = function(){
        return $http.get('/hegel.json')
    }
    return factory;
})

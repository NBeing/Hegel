var app  = angular.module('hegelApp' , ['ngRoute']);

app.config(function($routeProvider){
    $routeProvider.when('/natural',
                        {controller: 'NaturalController',
                         templateUrl: '/views/natural.html'
                        })
        .when('/sections',
              {controller: 'FindlayController',
               templateUrl: '/views/hegel.html'
              })
              .when('/',
              {controller: 'TocController',
               templateUrl: '/views/toc.html'
              }
)});

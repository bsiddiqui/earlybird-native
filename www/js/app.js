// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('earlybird', ['ionic'])

.controller('OnboardingCtrl', function ($scope, $ionicSlideBoxDelegate) {
  $scope.onboardingSlides = [{
    image: "http://www.pearlfisher.com/wp-content/uploads/2014/03/BlueBottle_02.jpg",
    title: "Blue Bottle New Orleans Iced Coffee",
    description: "New Orleans is a sweet and thick iced coffee"
  }, {
    image: "http://www.pearlfisher.com/wp-content/uploads/2014/03/BlueBottle_02.jpg",
    title: "Blue Bottle New Orleans Iced Coffee",
    description: "New Orleans is a sweet and thick iced coffee"
  }];

  $ionicSlideBoxDelegate.update();
})

.controller('LoginCtrl', function ($scope) {
})

.controller('RegisterCtrl', function ($scope) {
})

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  // onboarding
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'views/home.html'
  })
  .state('onboarding', {
    url: '/onboarding',
    templateUrl: 'views/onboarding.html',
    controller: 'OnboardingCtrl'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'LoginCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'views/register.html',
    controller: 'RegisterCtrl'
  })
  .state('order', {
    url: '/order',
    templateUrl: 'views/order.html'
  })
  .state('settings', {
    url: '/settings',
    templateUrl: 'views/settings.html'
  })
  .state('invite', {
    url: '/invite',
    templateUrl: 'views/invite.html'
  })
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

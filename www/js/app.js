angular.module('earlybird', ['ionic', 'ngCookies', 'earlybird.services', 'earlybird.controllers'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  // $httpProvider.defaults.withCredentials = true;
  $httpProvider.defaults.useXDomain = true;

  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

  $httpProvider.interceptors.push('SessionInjector');

  $urlRouterProvider.otherwise('/home');

  // onboarding
  $stateProvider
  .state('earlybird', {
    abstract: true,
    controller: 'AppCtrl',
    resolve: {
      authorize: function (Session) {
        return Session.authenticate();
      }
    },
    template: '<ui-view/>'
  })
  .state('earlybird.home', {
    url: '/home',
    templateUrl: 'views/home.html'
  })
  .state('earlybird.onboarding', {
    url: '/onboarding',
    templateUrl: 'views/onboarding.html',
    controller: 'OnboardingCtrl'
  })
  .state('earlybird.login', {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'SessionCtrl'
  })
  .state('earlybird.register', {
    url: '/register',
    templateUrl: 'views/register.html',
    controller: 'SessionCtrl'
  })
  .state('earlybird.order', {
    url: '/order',
    templateUrl: 'views/order.html',
    controller: 'OrderCtrl'
  })
  .state('earlybird.settings', {
    url: '/settings',
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl'
  })
  .state('earlybird.sharing', {
    url: '/sharing',
    templateUrl: 'views/sharing.html'
  })
})

.run(function($ionicPlatform, $cookies, User) {
  // TODO replace with getting data
  $cookies['earlybird'] = 'a82157e637cb25131c5e35aee4857121f8d92812';

  // TODO if cookies doesnt exist or current user doesn't exist with cookie, send to home

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

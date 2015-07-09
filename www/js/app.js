angular.module('earlybird', ['ionic', 'ngCookies', 'earlybird.services', 'earlybird.controllers'])

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide) {
  $httpProvider.defaults.useXDomain     = true;
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

  $httpProvider.interceptors.push('HeadersInjector');

  $provide.decorator('$state', function ($delegate, $rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      $delegate.toState = toState;
      $delegate.toStateParams = toStateParams;
    });

    return $delegate;
  })

  $urlRouterProvider.otherwise('/home');

  $stateProvider
  .state('earlybird', {
    abstract: true,
    controller: 'AppCtrl',
    resolve: {
      authorize: function (Session) {
        return Session.authorize();
      }
    },
    template: '<ion-nav-view><ion-nav-view/>'
  })
  .state('earlybird.home', {
    url: '/home',
    templateUrl: 'views/home.html',
    requireAuth: false
  })
  .state('earlybird.onboarding', {
    url: '/onboarding',
    templateUrl: 'views/onboarding.html',
    controller: 'OnboardingCtrl',
    requireAuth: false
  })
  .state('earlybird.login', {
    url: '/login',
    templateUrl: 'views/login.html',
    controller: 'SessionCtrl',
    requireAuth: false
  })
  .state('earlybird.register', {
    url: '/register',
    templateUrl: 'views/register.html',
    controller: 'SessionCtrl',
    requireAuth: false
  })
  .state('earlybird.order', {
    url: '/order',
    templateUrl: 'views/order.html',
    controller: 'OrderCtrl',
    requireAuth: true,
    resolve: {
      items: function (Item) {
        return Item.findAll();
      },
      availability: function (Availability){
        return Availability.findAll()
        .then(function (res) {
          return new Availability(res);
        });
      }
    }
  })
  .state('earlybird.settings', {
    url: '/settings',
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl',
    requireAuth: true
  })
  .state('earlybird.sharing', {
    url: '/sharing',
    templateUrl: 'views/sharing.html',
    requireAuth: true
  })
})

.run(function($rootScope, $state, Session, User, $ionicPlatform, $cookies, User) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
    // if the user is resolved, do an authorization check immediately. otherwise,
    // it'll be done when the state it resolved.
    if (User.isCurrentResolved()) {
      Session.authorize();
    }
  })

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
  });
})

angular.module('earlybird', [
  'ionic',
  'ngCookies',
  'earlybird.services',
  'earlybird.controllers'
])

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide,
      $ionicConfigProvider) {
  $httpProvider.defaults.useXDomain     = true;
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

  $httpProvider.interceptors.push('HeadersInjector');

  $ionicConfigProvider.views.swipeBackEnabled(false);

  $provide.decorator('$state', function ($delegate, $rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState,
          toStateParams) {
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

.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="ios"></ion-spinner',
  hideOnStateChange: true
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
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(navigator && navigator.splashscreen) {
      setTimeout(function() {
        navigator.splashscreen.hide();
      }, 500);
    }
  });
})
.directive('resetField', ['$compile', '$timeout', function($compile, $timeout) {
  return {
    require: 'ngModel',
    scope: {},
    link: function(scope, el, attrs, ctrl) {
      // compiled reset icon template
      var template = $compile('<i ng-show="enabled" on-touch="resetField()" class="icon ion-ios-close reset-field-icon"></i>')(scope);
      el.addClass("reset-field");
      el.after(template);

      scope.resetField = function () {
        ctrl.$setViewValue(null);
        ctrl.$render();
        $timeout(function () {
          el[0].focus();
        }, 0, false);
        scope.enabled = false;
      };

      el
      .bind('input', function () {
        scope.enabled = !ctrl.$isEmpty(el.val());
      })
      .bind('focus', function () {
        $timeout(function () { //Timeout just in case someone else is listening to focus and alters model
          scope.enabled = !ctrl.$isEmpty(el.val());
          scope.$apply();
        }, 0, false);
      })
      .bind('blur', function () {
        $timeout(function () {
          scope.enabled = false;
          scope.$apply();
        }, 0, false);
      });
    }
  };
}]);

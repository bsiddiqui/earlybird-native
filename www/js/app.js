angular.module('earlybird', [
  'ionic',
  'ngAnimate',
  'ui.mask',
  'google.places',
  'angularMoment',
  'earlybird.services',
  'earlybird.controllers'
])

.config(function($stateProvider, $urlRouterProvider, $httpProvider, $provide,
      $ionicConfigProvider) {

  $httpProvider.defaults.cache          = true;
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
      },
      needFeedback: function (Order) {
        return Order.needFeedback();
      }
    },
    template: '<ion-nav-view><ion-nav-view/>'
  })
  .state('earlybird.home', {
    url: '/home',
    templateUrl: 'views/home.html',
    controller: 'SessionCtrl',
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
  .state('earlybird.address', {
    url: '/address',
    templateUrl: 'views/address.html',
    controller: 'SessionCtrl',
    requireAuth: true
  })
  .state('earlybird.card', {
    url: '/card',
    templateUrl: 'views/card.html',
    controller: 'SessionCtrl',
    requireAuth: true
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
      availability: function (Availability) {
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
  hideOnStateChange: true,
  duration: 10000
})

.constant('angularMomentConfig', {
  timezone: 'America/Los_Angeles'
})

.run(function($rootScope, $state, $ionicPlatform, Session, User) {
  $rootScope.$on('$stateChangeStart',
      function (event, toState, toStateParams) {
    // if the user is resolved, do an authorization check immediately
    // otherwise will be done when the state it resolved.
    if (User.isCurrentResolved()) {
      Session.authorize();
    }
  });

  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(navigator && navigator.splashscreen) {
      setTimeout(function() {
        navigator.splashscreen.hide();
      }, 3000);
    }
  });

})

.directive('resetField', ['$compile', '$timeout',
    function($compile, $timeout) {
  return {
    require: 'ngModel',
    scope: {},
    link: function(scope, el, attrs, ctrl) {
      // compiled reset icon template
      var template =
        $compile
        ('<i ng-show="enabled" on-touch="resetField()" ' +
         'class="icon ion-ios-close reset-field-icon"></i>')
        (scope);
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
        // timeout in case someone else is listening and alters model
        $timeout(function () {
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
}])

.filter('addressFormat', function () {
  return function (address) {
    var formattedAddress = '';
    formattedAddress += address.street1;
    if (address.street2) formattedAddress +=
      (', ' + address.street2);
    formattedAddress +=
      (', ' + address.city + ', ' + address.state + ' ' + address.zip );
    return formattedAddress;
  }
})

.filter('orderTotal', function () {
  return function (total, promoBalance) {
    if (promoBalance > 0) {
      total = Math.max(total - promoBalance, 0) + ' after promo'
    }
    return total;
  }
})

.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      if (element[0].firstElementChild == document.activeElement) return;
      $timeout(function() {
        element[0].focus();
      }, 500);
    }
  };
})

.directive('onSubmit', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$apply(function (){
          scope.$eval(attrs.onSubmit);
        });

        event.preventDefault();
      }
    });
  };
})

.directive('onLongLongHold', function ($timeout) {
  return function (scope, element, attrs) {
    var promise;
    element.bind("mousedown touchstart", function () {
      promise = $timeout(function () {
        scope.$apply(function (){
          scope.$eval(attrs.onLongLongHold);
        });
      }, 10000);
    })

    element.bind('mouseup touchend', function () {
      $timeout.cancel(promise);
    })
  }
});

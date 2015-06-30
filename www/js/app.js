angular.module('earlybird', ['ionic', 'ngCookies', 'earlybird.services'])

.controller('OnboardingCtrl', function ($scope, $ionicSlideBoxDelegate) {
  $scope.onboardingSlides = [{
    image: "img/img-bluebottle2x.png",
    title: "Blue Bottle New Orleans Iced Coffee",
    description: "New Orleans is a sweet and thick iced coffee"
  }, {
    image: "img/img-bluebottle2x.png",
    title: "Blue Bottle New Orleans Iced Coffee",
    description: "New Orleans is a sweet and thick iced coffee"
  }];

  $ionicSlideBoxDelegate.update();
})

.controller('SessionCtrl', function ($scope, $state) {

  $scope.login = function () {
    $state.go('earlybird.order');
  }


  $scope.register = function (params) {
  }
})

.controller('SettingsCtrl', function ($scope, $state, $ionicViewSwitcher, User, Address) {
  $scope.inputDisabled = true;

  $scope.enableInput = function (password) {
    $scope.inputDisabled = false;
  }

  $scope.disableInput = function () {
    $scope.inputDisabled = true;
  }

  $scope.saveInput = function (user) {
    console.log(user);
    return User.update({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone
    })
    .then(function (res) {
      User.setCurrent(res);
      // $ionicViewSwitcher.nextDirection('forward');
      // $state.go('order');
      $scope.inputDisabled = true;
    })
  }

  $scope.logout = function () {
    $ionicViewSwitcher.nextDirection('exit');
    $state.go('earlybird.home');
  }

  $scope.deleteAddress = function (address, index) {
    return Address.delete(address.id)
    .then(function () {
      $scope.currentUser.addresses.splice(index, 1);
    })
  }
})

.controller('OrderCtrl', function ($scope, User, Item) {
  $scope.order = {}
  $scope.order.quantity = 1;
  $scope.order.address  = $scope.currentUser.addresses[0];
  $scope.order.payment  = $scope.payments[0];

  Item.findAll()
  .then(function (res) {
    $scope.items = res;
  })

  $scope.incQuantity = function () {
    $scope.order.quantity++;
  }

  $scope.decQuantity = function () {
    if ($scope.order.quantity === 1) {
      return
    } else {
      $scope.order.quantity--;
    }
  }

})

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
    controller: function ($scope, $ionicModal, User) {
      $scope.currentUser = User.currentUser;

      // TODO remove
      $scope.payments = [{
        title: 'Earlybird Team',
        type: 'visa',
        last_four: '6404'
      }, {
        title: 'Personal Citi',
        type: 'mastercard',
        last_four: '6404'
      }]

      $ionicModal.fromTemplateUrl('views/partials/add-address.html', {
        scope: $scope,
        animation: 'slide-in-up'
      })
      .then(function(modal) {
        $scope.addressModal = modal;

        $scope.createAddress = function (address) {
          return Address.create(address)
          .then(function (res) {
            $scope.currentUser.addresses.push(res);
            $scope.addressModal.hide();
          })
        };
      });

      $ionicModal.fromTemplateUrl('views/partials/add-payment.html', {
        scope: $scope,
        animation: 'slide-in-up'
      })
      .then(function(modal) {
        $scope.paymentModal = modal;
      });
    },
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

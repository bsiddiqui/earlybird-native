// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('earlybird', ['ionic'])

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

.controller('SessionCtrl', function ($scope, $state, $ionicModal, $ionicViewSwitcher) {
  $scope.currentUser = {
    first_name: 'Basil',
    last_name: 'Siddiqui',
    email: 'basil@earlybird.com',
    phone: '9162146370'
  };

  $scope.addresses = [{
    title: 'Work',
    street1: '2130 Post St',
    street2: '#303',
    city: 'San Francisco',
    state: 'CA',
    zip: '94109'
  }, {
    title: 'Personal',
    street1: '2130 Post St',
    street2: '#303',
    city: 'San Francisco',
    state: 'CA',
    zip: '94109'
  }];

  $scope.payments = [{
    title: 'Earlybird Team',
    type: 'visa',
    last_four: '6404'
  }, {
    title: 'Personal Citi',
    type: 'mastercard',
    last_four: '6404'
  }]

  $scope.login = function () {
    $state.go('order');
  }

  $scope.logout = function () {
    $ionicViewSwitcher.nextDirection('exit');
    $state.go('home');
  }

  $ionicModal.fromTemplateUrl('views/partials/add-address.html', {
    scope: $scope,
    animation: 'slide-in-up'
  })
  .then(function(modal) { $scope.addressModal = modal; });

  $ionicModal.fromTemplateUrl('views/partials/add-payment.html', {
    scope: $scope,
    scope: $scope,
    animation: 'slide-in-up'
  })
  .then(function(modal) { $scope.paymentModal = modal; });


})

.controller('SettingsCtrl', function ($scope, $state, $ionicViewSwitcher) {
  $scope.inputDisabled = true;

  $scope.enableInput = function (password) {
    $scope.inputDisabled = false;
  }

  $scope.disableInput = function () {
    $scope.inputDisabled = true;
  }

  $scope.saveInput = function () {
    $ionicViewSwitcher.nextDirection('forward');
    // save user
    $state.go('order');
    $scope.inputDisabled = true;
  }
})

.controller('OrderCtrl', function ($scope) {
  $scope.order          = {};
  $scope.order.quantity = 1;
  $scope.order.address  = $scope.addresses[0];
  $scope.order.payment  = $scope.payments[0];

  $scope.items = [{
    image: 'img/img-bluebottle-wide.png',
    title: 'Earlybird iced coffee',
    description: 'Cold breweed iced coffee produced in a join venture by Stumptown Roasters and Chateu Daniel Siddiqui'
  }]

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

// TODO add this
.filter('formattedAddress', function () {
  return function (address) {
  }
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
    controller: 'SessionCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'views/register.html',
    controller: 'SessionCtrl'
  })
  .state('order', {
    url: '/order',
    templateUrl: 'views/order.html',
    controller: 'OrderCtrl'
  })
  .state('settings', {
    url: '/settings',
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl'
  })
  .state('sharing', {
    url: '/sharing',
    templateUrl: 'views/sharing.html'
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

angular.module('earlybird.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, User, Address) {
  $scope.currentUser = User.currentUser;

  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  }

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
})

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

.controller('SessionCtrl', function ($scope, $state, $cookies, Session, User) {

  $scope.login = function (params) {
    Session.create(params)
    .then(function () {
      $state.go('earlybird.order');
    });
  };


  $scope.register = function (params) {
    User.create(params)
    .then(function () {
      $state.go('earlybird.order');
    })
  };
})

.controller('SettingsCtrl', function ($scope, $state, $ionicViewSwitcher, User, Address, Session) {
  $scope.inputDisabled = true;

  $scope.enableInput = function (password) {
    $scope.inputDisabled = false;
  }

  $scope.disableInput = function () {
    $scope.inputDisabled = true;
  }

  $scope.saveInput = function (user) {
    return User.update({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone
    })
    .then(function (res) {
      $scope.setCurrentUser(User.currentUser);
      // $ionicViewSwitcher.nextDirection('forward');
      // $state.go('order');
      $scope.inputDisabled = true;
    })
  }

  $scope.logout = function () {
    Session.delete()
    .then(function() {
      $ionicViewSwitcher.nextDirection('exit');
      $scope.setCurrentUser(undefined)
      $state.go('earlybird.home');
    });
  }

  $scope.deleteAddress = function (address, index) {
    return Address.delete(address.id)
    .then(function () {
      $scope.currentUser.addresses.splice(index, 1);
    })
  }
})

.controller('OrderCtrl', function ($scope, User, Item) {
  $scope.setCurrentUser(User.currentUser);

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

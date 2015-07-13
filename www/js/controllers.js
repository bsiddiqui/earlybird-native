angular.module('earlybird.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $ionicLoading, Card,
      User, Address) {
  $scope.currentUser = User.currentUser;

  $scope.setCurrentUser = function (user) {
    $scope.currentUser = user;
  }

  $scope.alert = function (message, title) {
    if (navigator && navigator.notification) {
      navigator.notification.alert(message, null, title);
    } else {
      alert(message);
    }
  };

  $scope.confirm = function (message, callback, title) {
    if (navigator && navigator.notification) {
      navigator.notification.confirm(title, callback, message, ['Yes', 'No']);
    } else {
      callback(1);
    }
  }

  $ionicModal.fromTemplateUrl('views/partials/add-address.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  })
  .then(function(modal) {
    $scope.addressModal = modal;

    $scope.createAddress = function (address) {
      $ionicLoading.show();

      return Address.create(address)
      .success(function (data) {
        $scope.currentUser.addresses.push(data);
        $scope.addressModal.hide();
        $ionicLoading.hide();
      })
      .error(function (err) {
        $scope.alert(err.message, 'Uh oh, we weren\'t able to find that address');
        console.log(err);
      })
    };
  });

  $ionicModal.fromTemplateUrl('views/partials/add-card.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  })
  .then(function(modal) {
    $scope.cardModal = modal;

    $scope.createCard = function (card) {
      $ionicLoading.show();

      return Card.create(card)
      .success(function (data) {
        $scope.currentUser.cards.push(data);
        $scope.cardModal.hide();
        $ionicLoading.hide();
      })
      .error(function (err) {
        $scope.alert(err.message, 'Uh oh, we weren\'t able to verify that card');
      });
    };
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
    .success(function (res) {
      $state.go('earlybird.order');
    })
    .error(function (err) {
      $scope.alert(err.message, 'Uh oh, we weren\'t able to log you in');
    });
  };

  $scope.register = function (params) {
    User.create(params)
    .success(function () {
      $state.go('earlybird.order');
    })
    .error(function (err) {
      $scope.alert(err.message, 'Uh oh, we weren\'t able to register you');
    });
  };
})

.controller('SettingsCtrl', function ($scope, $state, $ionicViewSwitcher,
      $ionicLoading, User, Address, Session, Card, PromoCode) {
  $scope.inputs = {};
  $scope.user = angular.copy(User.currentUser);

  $scope.cancelInput = function () {
    $scope.user = angular.copy(User.currentUser);
    $ionicViewSwitcher.nextDirection('forward');
    $state.go('earlybird.order');
  }

  $scope.saveInput = function (user) {
    $ionicLoading.show()

    return User.update({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone
    })
    .success(function () {
      $state.go('earlybird.order')
      $scope.setCurrentUser(User.currentUser);
    })
    .error(function (err) {
      $scope.alert(err.message, 'Update failed');
    });
  }

  $scope.redeemPromo = function (code) {
    if (!angular.isDefined(code)) return;

    return PromoCode.redeem(code)
    .success(function (data) {
      // TODO alert success
      $scope.inputs.code = undefined;
      $scope.currentUser.promo_codes.push(data);
    })
    .error(function (err) {
      $scope.alert(err.message, 'Uh oh, we weren\'t able to add that promo')
    });
  };

  $scope.logout = function () {
    $scope.confirm('Logout', function (res) {
      if (res === 1) {
        Session.delete()
        .then(function() {
          $ionicViewSwitcher.nextDirection('exit');
          $scope.setCurrentUser(undefined)
          $state.go('earlybird.home');
        });
      } else {
        return;
      }
    }, 'Are you sure you would like to sign out?');
  };

  $scope.deleteAddress = function (address, index) {
    return Address.delete(address.id)
    .success(function () {
      $scope.currentUser.addresses.splice(index, 1);
    });
  };

  $scope.deleteCard = function (card, index) {
    return Card.delete(card.id)
    .success(function () {
      $scope.currentUser.cards.splice(index, 1);
    });
  };
})

.controller('OrderCtrl', function ($scope, User, Order, items, availability) {
  $scope.setCurrentUser(User.currentUser);

  // TODO clean this up
  $scope.availability                 = availability;
  $scope.availability.next_open.start_time =
    new Date($scope.availability.next_open.start_time);
  $scope.items                        = items;
  $scope.order                        = {}
  $scope.order.item_id                = items[0].id;
  $scope.order.quantity               = 1;
  $scope.order.card_id                =
    User.currentUser.cards[0] && User.currentUser.cards[0].id;
  $scope.order.destination_address_id =
    User.currentUser.addresses[0] && User.currentUser.addresses[0].id;

  $scope.incQuantity = function (item) {
    if (item.quantity) {
      item.quantity++;
    } else {
      item.quantity = 1;
    }
  };

  $scope.decQuantity = function (item) {
    if (item.quantity === 0) {
      return
    } else {
      item.quantity--;
    }
  };

  $scope.orderValid = function (order) {
    return angular.isDefined(order.card_id) &&
      angular.isDefined(order.destination_address_id) &&
      $scope.order.quantity > 0;
      $scope.availability.now();
  };

  $scope.orderTotal = function (items) {
    var total = 0;

    _.forEach(items, function (item) {
      total += (item.price * item.quantity) || 0;
    })

    return total;
  };

  $scope.createOrder = function (order) {
    return Order.create(order)
    .success(function () {
      // TODO do something
    })
    .error(function (err) {
      $scope.alert(err.message, 'Uh oh, something looks wrong with your order');
    });
  };
})

angular.module('earlybird.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $interval,
      $ionicLoading, Order, CurrentOrder, Card, User, Address, Session,
      Feedback, needFeedback) {

  $scope.orderInProgress = needFeedback[0] ? true : false;
  $scope.order = CurrentOrder;

  $scope.setOrderInProgress = function (value) {
    $scope.orderInProgress = value;
  }

  $interval(function () {
    if (!User.currentUser) return;
    return Order.needFeedback()
    .then(function (data) {
      $scope.needFeedback = data[0];

      if ($scope.needFeedback) {
        $scope.resetFeedback();
        $scope.setOrderInProgress(true);
        $scope.feedbackModal.show();
      }
    })
  }, 10000)

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
      navigator.notification.confirm(
        title,
        callback,
        message,
        ['Yes', 'No']
      );
    } else {
      callback(1);
    }
  }

  $scope.needFeedback = needFeedback[0];
  $scope.feedback = {};

  $ionicModal.fromTemplateUrl('views/partials/add-feedback.html', {
    scope: $scope,
    animation: 'slide-in-up',
    hardwareBackButtonClose: false,
    backdropClickToClose: false
  })
  .then(function(modal) {
    $scope.feedbackModal = modal;

    $scope.resetFeedback = function () {
      $scope.feedback.reasons  = {};
      $scope.feedback.awesome  = true;
      $scope.feedback.order_id = $scope.needFeedback.id;
    };

    // TODO check why passing form doesn't work when interval opens modal
    $scope.createFeedback = function (feedback) {
      // var feedback = $scope.form;

      if (!feedback.awesome) {
        feedback.reason = [];
        // TODO rewrite
        _.forEach(feedback.reasons, function (v, k) {
          if (v) feedback.reason.push(k);
        });

        feedback.reason = feedback.reason.join(', ');
      }

      $ionicLoading.show();
      return Feedback.create(feedback)
      .success(function () {
        $scope.setOrderInProgress(false);
        $scope.feedbackModal.hide();
        $ionicLoading.hide();
      })
      .error(function (err) {
        $ionicLoading.hide();
        $scope.alert(err.message, 'Feedback failed');
      });
    }

    if ($scope.needFeedback) {
      $scope.resetFeedback();
      $scope.feedbackModal.show();
    }
  });
  $scope.newAddress={};

  $ionicModal.fromTemplateUrl('views/partials/add-address.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  })
  .then(function(modal) {
    $scope.addressModal = modal;
    $scope.newAddressOptions = {
      componentRestrictions: { country: 'us' }
    }

    $scope.$watch('newAddress.autocomplete', function () {
      if ($scope.newAddress.autocomplete &&
          $scope.newAddress.autocomplete.name
      ) {
        $scope.newAddress.title = $scope.newAddress.autocomplete.name;
      }
    })

    $scope.createAddress = function (address) {
      var details     = address.autocomplete.formatted_address.split(', ');
      address.street1 = details[0];
      address.city    = details[1];
      address.state   = details[2].split(' ')[0]
      address.zip     = details[2].split(' ')[1]

      $ionicLoading.show();

      return Address.create(address)
      .success(function (data) {
        $scope.currentUser.addresses.push(data);
        $scope.order.destination_address_id = data.id;
        $scope.addressModal.hide();
        $ionicLoading.hide();
      })
      .error(function (err) {
        $ionicLoading.hide();
        $scope.alert(err.message, 'Invalid address');
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
        $scope.order.card_id = data.id;
        $scope.cardModal.hide();
        $ionicLoading.hide();
      })
      .error(function (err) {
        $ionicLoading.hide();
        $scope.alert(err.message, 'Invalid card');
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

.controller('SessionCtrl', function ($scope, $state, $cookies, $ionicLoading,
      Session, User) {
  $scope.login = function (params) {
    $ionicLoading.show();

    Session.create(params)
    .success(function (res) {
      $state.go('earlybird.order');
    })
    .error(function (err) {
      $ionicLoading.hide();
      $scope.alert(err.message, 'Login error');
    });
  };

  $scope.register = function (params) {
    $ionicLoading.show();

    User.create(params)
    .success(function () {
      $state.go('earlybird.order');
    })
    .error(function (err) {
      $ionicLoading.hide();
      $scope.alert(err.message, 'Registration error');
    });
  };
})

.controller('SettingsCtrl', function ($scope, $state, $ionicViewSwitcher,
      $stateParams, $ionicLoading, User, Address, Session, Card, PromoCode) {

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
      $ionicLoading.hide();
      $scope.alert(err.message, 'Update failed');
    });
  }

  $scope.redeemPromo = function (code) {
    if (!angular.isDefined(code)) return;

    return PromoCode.redeem(code)
    .success(function (data) {
      // TODO alert success
      $scope.inputs.code = undefined;
      $scope.currentUser.codes.push(data);
    })
    .error(function (err) {
      $scope.alert(err.message, 'Promo redemption failed')
    });
  };

  $scope.logout = function () {
    $scope.confirm('Logout', function (res) {
      if (res === 1) {
        $ionicLoading.show();

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
    })
    .error(function (err) {
      $scope.alert(err.message, 'Address deletion failed');
    });
  };

  $scope.deleteCard = function (card, index) {
    return Card.delete(card.id)
    .success(function () {
      $scope.currentUser.cards.splice(index, 1);
    })
    .error(function (err) {
      $scope.alert(err.message, 'Card deletion failed')
    });
  };
})

.controller('OrderCtrl', function ($scope, $timeout, $q, $ionicPlatform,
      $ionicLoading, $ionicModal, $interval, User, Order, Item,
      Availability, CurrentOrder, items, availability) {

  $scope.setCurrentUser(User.currentUser);

  // TODO clean this up
  $scope.availability                 = availability;
  $scope.availability.next_open.start_time =
    new Date($scope.availability.next_open.start_time);
  $scope.items                        = items;
  $scope.items[0].quantity = 1;

  CurrentOrder.card_id = User.currentUser.cards[0] &&
      User.currentUser.cards[0].id;

  CurrentOrder.destination_address_id = User.currentUser.addresses[0] &&
      User.currentUser.addresses[0].id;

  $scope.order = CurrentOrder;

  $ionicPlatform.on('resume', function () {
    // TODO check feedback
    return $q.all([
      Item.findAll(),
      Availability.findAll()
    ])
    .then(function (data) {
      $scope.items        = data[0];
      $scope.availability = new Availability(data[1]);
    })
  })

  $scope.incQuantity = function (item) {
    if (item.quantity) {
      item.quantity++;
    } else {
      item.quantity = 2;
    }
  };

  $scope.decQuantity = function (item) {
    if (item.quantity === 1) {
      return
    } else {
      item.quantity--;
    }
  };

  $scope.orderValid = function (order) {
    return angular.isDefined(order.card_id) &&
      angular.isDefined(order.destination_address_id) &&
      $scope.availability.now() &&
      $scope.orderTotal($scope.items) > 0 &&
      !$scope.orderInProgress
  };

  $scope.orderTotal = function (items) {
    var total = 0;

    _.forEach(items, function (item) {
      total += (item.price * item.quantity) || 0;
    })

    return total;
  };

  $scope.createOrder = function (order) {
    order.order_items = []

    _.forEach($scope.items, function (item) {
      if (!item.quantity > 0) return;
      order.order_items.push({
        item_id: item.id,
        quantity: item.quantity
      });
    })

    $ionicLoading.show();
    return Order.create(order)
    .success(function () {
      $scope.setOrderInProgress(true)
      $ionicLoading.hide();
    })
    .error(function (err) {
      $ionicLoading.hide();
      $scope.alert(err.message, 'Order submission failed');
    });
  };
})

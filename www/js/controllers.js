angular.module('earlybird.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $interval,
      $ionicLoading, $ionicPlatform, Order, CurrentOrder, Card, User,
      Address, Session, Feedback, needFeedback) {

  $scope.orderInProgress = needFeedback[0] ? true : false;
  $scope.order = CurrentOrder;

  $scope.setOrderInProgress = function (value) {
    $scope.orderInProgress = value;
  }

  $ionicPlatform.on('resume', function () {
    return Session.authorize()
    .then(function () {
      $scope.currentUser = User.currentUser;
    });
  });

  $interval(function () {
    if (!User.currentUser || Feedback.inProgress) return;
    return Order.needFeedback()
    .then(function (data) {
      $scope.needFeedback = data[0];
      if ($scope.needFeedback) {
        $scope.needFeedback.completed_time =
          new Date ($scope.needFeedback.completed_time);
        $scope.needFeedback.created_at =
          new Date ($scope.needFeedback.created_at);
        $scope.resetFeedback();
        $scope.setOrderInProgress(true);
        $scope.feedbackModal.show();
        Feedback.inProgress = true;
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

  if ($scope.needFeedback) {
    $scope.needFeedback.completed_time =
      new Date ($scope.needFeedback.completed_time);
    $scope.needFeedback.created_at =
      new Date ($scope.needFeedback.created_at);
  }

  $scope.Feedback     = Feedback;
  $scope.feedback     = {};

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
        $scope.Feedback.inProgress = false;
        $scope.feedbackModal.hide();
        $ionicLoading.hide();
      })
      .error(function (err) {
        $ionicLoading.hide();
        $scope.alert(err.message, 'Feedback failed');
      });
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

    $scope.createAddress = function (address) {
      if ($scope.newAddress.form.$invalid) return;
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
        $scope.newAddress.params = {};
        $ionicLoading.hide();
      })
      .error(function (err) {
        $scope.newAddress.params.autocomplete = undefined;
        $ionicLoading.hide();
        $scope.alert(err.message, 'Invalid address');
      })
    };
  });

  $scope.newCard = {};
  $ionicModal.fromTemplateUrl('views/partials/add-card.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  })
  .then(function(modal) {
    $scope.cardModal = modal;

    $scope.createCard = function (card) {
      var exp        = card.exp.split(' / ');
      card.exp_month = exp[0];
      card.exp_year  = exp[1];
      if ($scope.newCard.form.$invalid) return;
      $ionicLoading.show();

      return Card.create(card)
      .success(function (data) {
        $scope.currentUser.cards.push(data);
        $scope.order.card_id = data.id;
        $scope.cardModal.hide();
        $scope.newCard.params = {};
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

.controller('SessionCtrl', function ($scope, $state, $ionicLoading,
      Session, User, Api) {
  /* dev mode */
  var mode = 'reg';
  $scope.switchMode = function () {
    if (mode === 'reg') {
      mode = 'dev';
      Api.switchDev();
      document.getElementsByClassName('home')[1]
        .style.backgroundColor = '#000';
    } else {
      mode = 'reg';
      Api.switchReg();
      document.getElementsByClassName('home')[1]
        .style.backgroundColor = '#E15726';
    }
  }
  /* end dev mode */

  $scope.login = function (params) {
    if ($scope.loginForm.form.$invalid) return;
    $ionicLoading.show();

    Session.create(params)
    .success(function (res) {
      $state.go('earlybird.order');
      $scope.loginForm.params = undefined;
    })
    .error(function (err) {
      $ionicLoading.hide();
      $scope.alert(err.message, 'Login error');
    });
  };

  $scope.register = function (params) {
    if ($scope.registerForm.form.$invalid) return;
    $ionicLoading.show();

    User.create(params)
    .success(function () {
      $state.go('earlybird.order');
      $scope.registerForm.params = undefined;
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

  PromoCode.get()
  .then(function (data) {
    User.currentUser.codes = data;
  })

  $scope.cancelInput = function () {
    $ionicViewSwitcher.nextDirection('forward');
    $state.go('earlybird.order');
    $scope.user        = angular.copy(User.currentUser);
    $scope.inputs.code = undefined;
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
      $scope.inputs.code = undefined;
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
      $timeout, Version, Availability, CurrentOrder, items, availability) {

  $ionicModal.fromTemplateUrl('views/partials/upgrade.html', {
    scope: $scope,
    animation: 'slide-in-up',
    hardwareBackButtonClose: false,
    backdropClickToClose: false
  })
  .then(function(modal) {
    $scope.upgradeModal = modal;
  });

  $scope.Version = Version;
  $scope.appVersion = '1.0.0';
  $timeout(function () {
    return Version.get()
    .success(function (data) {
      $scope.apiVersion = data.version;
      if ($scope.apiVersion != $scope.appVersion)
        $scope.upgradeModal.show();
    })
  }, 500)

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
      Availability.findAll(),
      Version.get()
    ])
    .then(function (data) {
      // if items have been changed
      if (data[0][0].id != $scope.items[0].id) {
          $scope.items        = data[0];
          $scope.items[0].quantity = 1;
      }
      $scope.availability = new Availability(data[1]);
      $scope.apiVersion = data[2].data.version;
      if ($scope.apiVersion != $scope.appVersion)
        $scope.upgradeModal.show();
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

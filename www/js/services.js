API_URL = 'http://earlybird-production-5dxaivnb9h.elasticbeanstalk.com/api/v1';
APP_KEY = 'd60b16fc51e7f8777ca2cde70ecdcbc1682ed76b';

angular.module('earlybird.services', [])

.factory('User', function ($http, $q, $cookies) {
  var User = function (data) {
    return angular.extend(this, data);
  }

  User.authenticated = false;

  User.currentUser = undefined;

  User.prototype.promoBalance = function () {
    var balance = 0;

    _.forEach(this.promo_codes, function (code) {
      balance += parseFloat(code.value);
    })

    return balance.toFixed(2);
  };

  User.isCurrentResolved = function () {
    return angular.isDefined(User.currentUser);
  };

  User.isAuthenticated = function () {
    return User.authenticated;
  };

  User.setCurrent = function (user) {
    return User.currentUser = new User(user);
  };

  User.getCurrent = function () {
    var deferred = $q.defer();

    // if we have retrieved the current users, immediately resolve
    if(User.isCurrentResolved()) {
      deferred.resolve(User.currentUser);

      return deferred.promise;
    } else { // otherwise get identity from server
      return $http.get(API_URL + '/users/current')
      .success(function (data) {
        User.currentUser = new User(data);
        User.authenticated = true;
        deferred.resolve(User.currentUser);
      })
      .error(function () {
        User.currentUser = null;
        User.authenticated = false;
        deferred.resolve(User.currentUser);
      });
    }
  };

  User.update = function (params) {
    return $http.patch(API_URL + '/users/' + User.currentUser.id, params)
    .then(function (res) {
      User.setCurrent(res.data);
      return res.data;
    });
  };

  User.create = function (params) {
    return $http.post(API_URL + '/users', params)
    .then(function (res) {
      User.authenticated = true;
      User.currentUser = new User(res.data);
      $cookies['earlybird'] = res.data.api_key;
      return res.data;
    });
  };

  return User;
})

.factory('Session', function ($http, $cookies, $location, $state, User) {
  var Session = function (data) {
    return angular.extend(this, data);
  }

  Session.authorize = function (toState) {
    return User.getCurrent()
    .then(function () {
      if ($state.toState.requireAuth && !User.isAuthenticated()) {
        event.preventDefault();
        $state.transitionTo('earlybird.home');
      }
    }, function () {
      if ($state.toState.requireAuth && !User.isAuthenticated()) {
        event.preventDefault();
        $state.transitionTo('earlybird.home');
      }
    });
  }

  Session.create = function (params) {
    return $http.post(API_URL + '/sessions', params)
    .then(function (res) {
      $cookies['earlybird'] = res.data.api_key;
      console.log('creationnnnnn', $cookies)
      User.authenticated = true;
      User.setCurrent(res.data);
      return res.data;
    })
  }

  Session.delete = function () {
    return $http.delete(API_URL + '/sessions')
    .then(function (res) {
      delete $cookies['earlybird'];
      User.currentUser = undefined;
      User.authenticated = false;
      return res.data;
    })
  }

  return Session;
})

.factory('Address', function ($http) {
  var Address = function (data) {
    return angular.extend(this, data);
  }

  Address.create = function (params) {
    return $http.post(API_URL + '/addresses', params)
    .then(function (res) {
      return res.data;
    })
  }

  Address.delete = function (id) {
    return $http.delete(API_URL + '/addresses/' + id)
    .then(function (res) {
      return res.data;
    });
  }

  return Address;
})

.factory('Card', function ($http) {
  var Card = function (data) {
    return angular.extend(this, data);
  }

  Card.create = function (params) {
    return $http.post(API_URL + '/cards', params)
    .then(function (res) {
      return res.data;
    })
  }

  Card.delete = function (id) {
    return $http.delete(API_URL + '/cards/' + id)
    .then(function (res) {
      return res.data;
    });
  }

  return Card;
})

.factory('Walkthrough', function ($http) {
  var Walkthrough = {};

  Walkthrough.findAll = function () {
    return $http.get(API_URL + '/walthrough')
    .then(function (res) {
      return res.data;
    })
  };

  return Walkthrough;
})

.factory('Item', function ($http) {
  var Item = {};

  Item.findAll = function () {
    return $http.get(API_URL + '/items')
    .then(function (res) {
      return res.data.objects;
    })
  };

  return Item;
})

.factory('Order', function ($http) {
  var Order = function (data) {
    return angular.extend(this, data);
  };

  Order.create = function (params) {
    return $http.post(API_URL + '/orders', params)
    .then(function (res) {
      return res.data;
    });
  };

  return Order;
})

.factory('Availability', function ($http) {
  var Availability = function (data) {
    return angular.extend(this, data);
  }

  Availability.findAll = function () {
    return $http.get(API_URL + '/availability')
    .then(function (res) {
      return res.data;
    })
  };

  Availability.prototype.nextAvailable = function () {
    var now = new Date()

    // the store is closed today
    if (!this.today.available) {
      return new Date(this.next_available.start_time);

    // the store is open today but hasn't opened yet
    } else if (new Date(this.today.start_time) > now)  {
      return new Date(this.today.start_time);

    // the store is open today but has closed for the day
    } else if (new Date(this.today.end_time) < now) {
      return new Date(this.next_available.start_time);
    }
  };

  return Availability;
})

.factory('PromoCode', function ($http) {
  var PromoCode = function (data) {
    return angular.extend(this, data)
  };

  PromoCode.redeem = function (code) {
    return $http.post(API_URL + '/promo_codes', { code: code })
    .then(function (res) {
      return res.data;
    });
  };

  return PromoCode;
})

.factory('HeadersInjector', function ($injector, $cookies) {
  return {
    request: function (config) {
      if ($cookies['earlybird']) {
        $injector.invoke(function (User) {
          config.headers['Authorization'] = 'Basic ' +
            // btoa(($cookies['earlybird'] || APP_KEY) + ':');
            btoa($cookies['earlybird'] + ':');
        })
      }

      return config;
    }
  }
});

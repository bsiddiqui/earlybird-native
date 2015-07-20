angular.module('earlybird.services', [])

.factory('Api', function () {
  return {
    url: 'https://api.eatearlybird.com/api/v1',
    switchDev: function () {
      this.url = 'http://earlybird-staging-y2cd8ddjdd.elasticbeanstalk.com/api/v1';
    },
    switchReg: function () {
      this.url = 'https://api.eatearlybird.com/api/v1';
    }
  };
})

.factory('User', function ($http, Api, $q) {
  var User = function (data) {
    return angular.extend(this, data);
  }

  User.authenticated = false;

  User.currentUser = undefined;

  User.prototype.promoBalance = function () {
    var balance = 0;

    _.forEach(this.codes, function (code) {
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
      return $http.get(Api.url + '/users/current')
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
    return $http.patch(Api.url + '/users/' + User.currentUser.id, params)
    .success(function (data) {
      User.setCurrent(data);
      return data;
    });
  };

  User.create = function (params) {
    return $http.post(Api.url + '/users', params)
    .success(function (data) {
      User.authenticated = true;
      User.currentUser = new User(data);
      window.localStorage['earlybird'] = data.api_key;
      return data;
    })
    .error(function (err) {
      return err;
    });
  };

  return User;
})

.factory('Session', function ($http, Api, $location, $state, User) {
  var Session = function (data) {
    return angular.extend(this, data);
  }

  Session.authorize = function (toState) {
    return User.getCurrent()
    .then(function () {
      // if state requires auth and user is not authenticated
      if ($state.toState.requireAuth && !User.isAuthenticated()) {
        event.preventDefault();
        $state.transitionTo('earlybird.home');

      // if state doesn't require auth and user is authenticated
      } else if (!$state.toState.requireAuth && User.isAuthenticated()) {
        event.preventDefault();
        $state.transitionTo('earlybird.order');
      }
    }, function () {
      if ($state.toState.requireAuth && !User.isAuthenticated()) {
        event.preventDefault();
        $state.transitionTo('earlybird.home');
      }
    });
  }

  Session.create = function (params) {
    return $http.post(Api.url + '/sessions', params)
    .success(function (data) {
      window.localStorage['earlybird'] = data.api_key;
      User.authenticated = true;
      User.setCurrent(data);
      return data;
    })
    .error(function (err) {
      return err;
    })
  }

  Session.delete = function () {
    return $http.delete(Api.url + '/sessions')
    .then(function (res) {
      delete window.localStorage['earlybird'];
      User.currentUser = undefined;
      User.authenticated = false;
      return res.data;
    })
  }

  return Session;
})

.factory('Address', function ($http, Api) {
  var Address = function (data) {
    return angular.extend(this, data);
  };

  Address.create = function (params) {
    return $http.post(Api.url + '/addresses', params);
  };

  Address.delete = function (id) {
    return $http.delete(Api.url + '/addresses/' + id);
  };

  return Address;
})

.factory('Card', function ($http, Api) {
  var Card = function (data) {
    return angular.extend(this, data);
  };

  Card.create = function (params) {
    return $http.post(Api.url + '/cards', params);
  };

  Card.delete = function (id) {
    return $http.delete(Api.url + '/cards/' + id);
  };

  return Card;
})

.factory('Walkthrough', function ($http, Api) {
  var Walkthrough = {};

  Walkthrough.findAll = function () {
    return $http.get(Api.url + '/walthrough')
    .then(function (res) {
      return res.data;
    })
  };

  return Walkthrough;
})

.factory('Item', function ($http, Api) {
  var Item = {};

  Item.findAll = function () {
    return $http.get(Api.url + '/items')
    .then(function (res) {
      return res.data.objects;
    })
  };

  return Item;
})

.factory('Order', function ($http, Api) {
  var Order = function (data) {
    return angular.extend(this, data);
  };

  Order.create = function (params) {
    return $http.post(Api.url + '/orders', params);
  };

  // TODO handle with success/error
  Order.needFeedback = function () {
    return $http.get(Api.url + '/orders?without_feedback=true', { cache: false })
    .then(function (res) {
      return res.data.objects || {};
    }, function (err) {
      return err;
    })
  };

  return Order;
})

.factory('CurrentOrder', function () {
  return {};
})

.factory('Availability', function ($http, Api) {
  var Availability = function (data) {
    return angular.extend(this, data);
  }

  Availability.findAll = function () {
    return $http.get(Api.url + '/availability', { cache: false })
    .then(function (res) {
      return res.data;
    })
  };

  /**
    * Determines if store is open now
    */
  Availability.prototype.now = function () {
    var now = new Date();

    return this.today.available && new Date(this.today.start_time) < now
      && new Date(this.today.end_time) > now;
  };

  Availability.prototype.next = function () {
    var now = new Date();

    return this.today.available && new Date(this.today.start_time) > now ?
      new Date(this.today.start_time) :
      new Date(this.next_open.start_time)
  }

  return Availability;
})

.factory('PromoCode', function ($http, Api) {
  var PromoCode = function (data) {
    return angular.extend(this, data)
  };

  PromoCode.redeem = function (code) {
    return $http.post(Api.url + '/codes',
        { code: code }, { cache: false });
  };

  PromoCode.get = function () {
    return $http.get(Api.url + '/codes')
    .then(function (res) {
      return res.data.objects;
    })
  }

  return PromoCode;
})

.factory('Feedback', function ($http, Api) {
  var Feedback = function (data) {
    return angular.extend(this, data)
  };

  Feedback.inProgress = false;

  Feedback.create = function (params) {
    return $http.post(Api.url + '/feedback', params);
  };

  return Feedback;
})

.factory('HeadersInjector', function ($injector) {
  return {
    request: function (config) {
      if (window.localStorage['earlybird']) {
        $injector.invoke(function (User) {
          config.headers['Authorization'] = 'Basic ' +
            btoa(window.localStorage['earlybird'] + ':');
        })
      }

      return config;
    }
  }
});

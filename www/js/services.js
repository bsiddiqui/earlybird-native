API_URL = 'http://earlybird-production-5dxaivnb9h.elasticbeanstalk.com/api/v1';
APP_KEY = 'd60b16fc51e7f8777ca2cde70ecdcbc1682ed76b';

angular.module('earlybird.services', [])

.factory('User', function ($http, $q, $cookies) {
  var User = function (data) {
    return angular.extend(this, data);
  }

  User.authenticated = false;

  User.currentUser = undefined;

  User.isCurrentResolved = function () {
    return angular.isDefined(User.currentUser);
  }

  User.isAuthenticated = function () {
    return User.authenticated;
  }

  User.setCurrent = function (user) {
    return User.currentUser = user;
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
        User.currentUser = data;
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
      User.currentUser = res.data;
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
    angular.extend(this, data);
  }

  Order.create = function (params) {
    return $http.post(API_URL + '/orders')
    .then(function (res) {
      return res.data;
    })
  };

  return Order;
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

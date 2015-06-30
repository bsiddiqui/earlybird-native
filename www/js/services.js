API_URL = 'http://earlybird-production-5dxaivnb9h.elasticbeanstalk.com/api/v1';
APP_KEY = 'd60b16fc51e7f8777ca2cde70ecdcbc1682ed76b';

angular.module('earlybird.services', [])

.factory('User', function ($http) {
  var User = function (data) {
    return angular.extend(this, data);
  }

  User.setCurrent = function (user) {
    User.currentUser = user;
  };

  User.getCurrent = function () {
    return $http.get(API_URL + '/users/current')
    .then(function (res) {
      User.setCurrent(res.data);
      console.log(res.data);
      return res.data;
    });
  };

  User.update = function (params) {
    return $http.patch(API_URL + '/users/' + User.currentUser.id)
    .then(function (res) {
      User.setCurrent(res.data);
      return res.data;
    });
  };

  User.create = function (params) {
    return $http.post(API_URL + '/users', params)
    .then(function (res) {
      return res.data;
    });
  };

  return User;
})

.factory('Session', function ($http, User) {
  var Session = function (data) {
    return angular.extend(this, data);
  }

  Session.authenticate = function () {
    return User.getCurrent()
    .then(function (res) {
      console.log(res);
      return res;
    }, function (err) {
      console.log(err);
      return err;
    })
  }

  Session.create = function (params) {
    return $http.post(API_URL + '/sessions', params)
    .then(function (res) {
      User.setCurrent(res.data);
      return res.data;
    })
  }

  Session.delete = function () {
    User.setCurrent(undefined);

    return $http.delete(API_URL + '/sessions')
    .then(function (res) {
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
      console.log(res);
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
    return $http.get(API_URL, '/items')
    .then(function (res) {
      return res.data;
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

.factory('SessionInjector', function ($injector, $cookies) {
  return {
    request: function (config) {
      $injector.invoke(function (User) {
        config.headers['Authorization'] = 'Basic ' +
          btoa(($cookies['earlybird'] || APP_KEY) + ':');
      })

      return config;
    }
  }
});

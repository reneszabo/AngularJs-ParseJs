'use strict';

/**
 * @ngdoc overview
 * @name publicHtmlApp
 * @description
 * # publicHtmlApp
 *
 * Main module of the application.
 */

angular.module('parse.model', [])
        .factory('User', function () {
          var obj = Parse.User.extend();
          /*--- Username -------------------------------------------------------------*/
          obj.prototype.__defineGetter__("username", function () {
            return this.get("username");
          });
          obj.prototype.__defineSetter__("username", function (v) {
            return this.set("username", v);
          });
          /*--- Password -------------------------------------------------------------*/
          obj.prototype.__defineGetter__("password", function () {
            return this.get("password");
          });
          obj.prototype.__defineSetter__("password", function (v) {
            return this.set("password", v);
          });
          return obj;
        })
        .factory('Ad', ['$q', 'UserHasAd', function ($q, UserHasAd) {
            var obj = Parse.Object.extend("Ad", {
              checkUser: function () {
                console.log("checkUser", this.id);
                if (this.user != null && Parse.User.current() != null) {
                  this.hasUser = (this.user.id === Parse.User.current().id);
                } else {
                  this.hasUser = false;
                }
                this.notifyWatches();
                return this.hasUser;
              },
              notifyWatches: function () {
                console.log("notifyWatches", this.id);
                if (this.render !== null) {
                  this.render.$apply();
                }
              },
              initialize: function (attrs, options) {
                this.user = 0;
                this.count = 0;
                this.render = null;
                this.hasUser = false;
                this.userHasAd = new UserHasAd();
              },
              fetch: function (options) {
                var _self = this;
                console.log("fetch", this.id);
                var _arguments = arguments;
                var relation = _self.relation('info');
                var qRelation = relation.query();
                qRelation.include('user');
                qRelation.equalTo('user', Parse.User.current());
                qRelation.first({
                  success: function (info) {
                    if (info === undefined) {
                      _self.user = null;
                    } else {
                      _self.user = info.get('user');
                      this.userHasAd = info;
                    }
                    _self.checkUser();
                    return _self.user;
                  }
                });
                //COUNT ALL USER RATED THE AD
                var relation2 = _self.relation('info');
                var qRelation2 = relation2.query();
                qRelation2.count({
                  success: function (count) {
                    // The count request succeeded. Show the count
                    _self.count = count;
                    _self.notifyWatches();
                  },
                  error: function (error) {
                    // The request failed
                  }
                });


                return (function (_this) {
                  return function () {
                    return _this.constructor.__super__.fetch.apply(_this, _arguments);
                  };
                })(this);
              }
            });
            /*--- Title ----------------------------------------------------------------*/
            obj.prototype.__defineGetter__("title", function () {
              return this.get("title");
            });
            /*--- Price ----------------------------------------------------------------*/
            obj.prototype.__defineGetter__("price", function () {
              return this.get("price");
            });
            /*--- File -----------------------------------------------------------------*/
            obj.prototype.__defineGetter__("file", function () {
              return this.get("file");
            });
            /*--- limitClicks -----------------------------------------------------------------*/
            obj.prototype.__defineGetter__("limitClicks", function () {
              return this.get("limitClicks");
            });
            return obj;
          }])
        .factory('UserHasAd', function ($q) {
          var obj = Parse.Object.extend("UserHasAd");
          /*--- User -----------------------------------------------------------------*/
          obj.prototype.__defineGetter__("user", function () {
            return this.get("user");
          });
          obj.prototype.__defineSetter__("user", function (v) {
            return this.set("user", v);
          });
          /*--- Quality -------------------------------------------------------------*/
          obj.prototype.__defineGetter__("quality", function () {
            return this.get("quality");
          });
          obj.prototype.__defineSetter__("quality", function (v) {
            return this.set("quality", v);
          });
          /*--- Comment -------------------------------------------------------------*/
          obj.prototype.__defineGetter__("comment", function () {
            return this.get("comment");
          });
          obj.prototype.__defineSetter__("comment", function (v) {
            return this.set("comment", v);
          });
          /*--- Ad -------------------------------------------------------------*/
          obj.prototype.__defineGetter__("ad", function () {
            return this.get("ad");
          });
          obj.prototype.__defineSetter__("ad", function (v) {
            return this.set("ad", v);
          });
          return obj;
        });
angular.module('parse.service', [])
        .service('AdService', ['$q', 'Ad', 'UserHasAd', function ($q, Ad, UserHasAd) {
            var ads = [];
            this.get = function (id) {
              var defer = $q.defer();
              var query = new Parse.Query(Ad);
              query.get(id, {
                success: function (data) {
                  defer.resolve(data);
                },
                error: function (er) {
                  defer.reject(er);
                }
              });
              return defer.promise;
            };
            this.list = function () {
              var defer = $q.defer();
              var query = new Parse.Query(Ad);
              query.find({
                success: function (data) {
                  ads = data;
                  ads.forEach(function (ad, index, array) {
                    //GET IF THE CURRENT USER HAS A RELATION WITH THIS AD
                    ad.fetch();
                  });
                  return data;
                },
                error: function (er) {
                  defer.reject(er);
                }
              }).then(function () {
                defer.resolve(ads);
              });
              return defer.promise;
            };

          }]);
angular.module('parse.directive', []);
angular.module('parse.filter', ['ngSanitize'])
        .filter('trusted', ['$sce', function ($sce) {
            return function (url) {
              return $sce.trustAsResourceUrl(url);
            };
          }]);
angular.module('parse', ['parse.service', 'parse.directive', 'parse.filter', 'parse.model'])
        .run(['$rootScope', 'User',
          function ($rootScope) {
            var app_id = "YgTvxgdlABgPvHClEzJhRcZ4H3ndAdBEU5bNPjZG";
            var js_key = "Lg8zRkp2BN8sbu37or3QCQaJ7ZRwlX8BzYJQHaDK";
            Parse.initialize(app_id, js_key);
            $rootScope.currentUser = Parse.User.current();
          }
        ]);

var app = angular
        .module('parseWithRelations', [
          'ngAnimate',
          'ngCookies',
          'ngResource',
          'ngRoute',
          'ngSanitize',
          'ngTouch',
          'parse'

        ]).config(function ($routeProvider) {
  $routeProvider
          .when('/', {
            templateUrl: 'views/main.html',
            controller: 'MainController'
          })
          .when('/connect/:formType', {
            templateUrl: 'views/login.html',
            controller: 'LoginController'
          })
          .otherwise({
            redirectTo: '/'
          });
  ;
});

'use strict';

/**
 * @ngdoc function
 * @name publicHtmlApp.controller:ads
 * @description
 * # Ads
 * Controller of the publicHtmlApp
 */
app.controller('AdsController', ['$scope', '$location', '$rootScope', 'AdService', 'UserHasAd', function ($scope, $location, $rootScope, AdService, UserHasAd) {
    $scope.ads = [];

    AdService.list().then(function (ads) {
      $scope.ads = ads;
    }, function (aError) {
      // Something went wrong, handle the error
      return null;
    });
    $scope.initAdRender = function (ad, render) {
      ad.render = render;
    };
//    $scope.$watch('ads',function(){console.log('cambio')});
    $scope.submitSurvey = function (ad) {
      var q = new Parse.Query(UserHasAd);
      if ($rootScope.currentUser === null) {
        $location.path("/connect/login");
        return 0;
      }
      q.equalTo('user', Parse.User.current());
      q.equalTo('ad', ad);
      q.first().then(
              function (data) {
                if (data === undefined) {
                  ad.userHasAd.user = Parse.User.current();
                  ad.userHasAd.ad = ad;
                  ad.userHasAd.save().then(
                          function (data) {
                            console.log('save', data);
                            relateAdWithUser(data);
                          },
                          function (er) {
                            console.log(er);
                          }
                  );
                } else {
                  relateAdWithUser(data);
                }
              },
              function (er) {
                console.log(er);
              }
      );
    };
    function relateAdWithUser(userHasAd) {
      var ad = userHasAd.get('ad');
      var r = ad.relation('info');
      r.add(userHasAd);
      ad.save().then(function () {
        ad.fetch();
      });
      ;
    }

  }]);

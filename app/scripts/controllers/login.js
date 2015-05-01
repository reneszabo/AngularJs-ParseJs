'use strict';

/**
 * @ngdoc function
 * @name publicHtmlApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the publicHtmlApp
 */
app.controller('LoginController', ['$scope', '$animate', '$location', '$rootScope', '$routeParams', '$route', 'User', function ($scope, $animate, $location, $rootScope, $routeParams, $route, User) {
    $scope.submitted = false;
    $scope.formType = 'login';
    $scope.errorMsg = "";
    function hasError() {
      if ($scope.errorMsg.length > 0) {
        return true;
      }
      return false;
    }

    if ($routeParams.formType !== undefined) {
      $scope.formType = $routeParams.formType;
    }
    if ($scope.formType == "register") {
      $scope.welcomeMessage = "We welcome U, new one. <br>Let the force be with U.";
      $scope.welcomeImg = "v.jpg";
      $scope.welcomeButton = "Register";
      $scope.welcomeCreate = "Sign in with your account";
      $scope.formTypeInvert = "login";
    } else {
      $scope.welcomeMessage = "Sign in to sense the force";
      $scope.welcomeImg = "j.jpg";
      $scope.welcomeButton = "Sign in";
      $scope.welcomeCreate = "Create an account";
      $scope.formTypeInvert = "register";

    }
    if ($rootScope.currentUser !== null) {
      $location.path("/");
    } else {
      $scope.user = new User();
    }

    function loginSuccessful(user) {
      $rootScope.$apply(function () {
        // set the current user
        $rootScope.currentUser = Parse.User.current();
        // redirect
        $location.path("/");
      });
    }

    function loginUnsuccessful(error) {
      console.log(error);
      console.log(error);
      removeShake();
      $scope.$apply($animate.addClass('.account-wall', 'shake-a'));
    }

    $rootScope.loggedIn = function () {
      if ($rootScope.currentUser === null) {
        return false;
      } else {
        return true;
      }
    };

    $scope.login = function (isValid) {
      if (isValid) {
        console.log($scope.formType);
        if ($scope.formType === 'login') {
          Parse.User.logIn($scope.user.username, $scope.user.password, {
            success: loginSuccessful,
            error: loginUnsuccessful
          });
        } else if ($scope.formType === 'register') {
          $scope.user.signUp(null, {
            success: loginSuccessful,
            error: loginUnsuccessful
          });
        }

      }
    };

    $scope.logout = function () {
      $scope.$emit('logout-user');
      $rootScope.currentUser = null;
      Parse.User.logOut();
    };




  }]).directive('shakeThat', ['$animate', function ($animate) {

    return {
      require: '^form',
      scope: {
        submit: '&',
        submitted: '='
      },
      link: function (scope, element, attrs, form) {
        // listen on submit event
        element.on('submit', function () {
          // tell angular to update scope
          scope.$apply(function () {
            // everything ok -> call submit fn from controller
            if (form.$valid)
              return scope.submit();
            // show error messages on submit
            scope.submitted = true;
            // shake that form
            removeShake();
            $animate.addClass(element, 'shake-a', function () {
              $animate.removeClass(element, 'shake-a');
            });
            return false;
          });
        });
      }
    };

  }]);
var timeOut = null;
function removeShake() {
  $('.shake-a').removeClass('shake-a');
  if (timeOut != null) {
    clearTimeout(timeOut);
  }
  timeOut = setTimeout(function () {
    $('.shake-a').removeClass('shake-a');
  }, 1000);
}
;

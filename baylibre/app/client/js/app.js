var app = angular.module('app', ['ngRoute']);

var temp_token = "Y1TIM4ARNgZtd7RTIWw9lOuXZSuBHzR1FlYziYHEO4";

app.controller('indexCtrl',  function($scope){
		$scope.titre = "Users service !!";

});

app.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

	$httpProvider.defaults.headers.common.Authorization = temp_token;

	$routeProvider
	// User route
		.when('/showUsers', {
			templateUrl : 'templates/users/showUsers.html',
			controller : 'showUsersController'
		})
		.when('/detailUser/:id', {
			templateUrl : 'templates/users/detailUser.html',
			controller : 'detailUserController'
		})
		.when('/addUser', {
			templateUrl : 'templates/users/addUser.html',
			controller : 'addUserController'
		})
		.when('/editUser/:id', {
			templateUrl : 'templates/users/editUser.html',
			controller : 'editUserController'
		})
		.when('/deleteUser/:id', {
			templateUrl : 'templates/users/showUsers.html',
			controller : 'deleteUserController'
		})
		.when('/findUser', {
			templateUrl : 'templates/users/findUsers.html',
			controller : 'findUserController'
		})
		// Role route
		.when('/showRoles', {
			templateUrl : 'templates/roles/showRoles.html',
			controller : 'showRolesController'
		})
	 	.otherwise({redirectTo : '/'});
 }]);

 
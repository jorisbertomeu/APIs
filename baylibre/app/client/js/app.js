var app = angular.module('app', ['ngRoute']);

var temp_token = "Y1TIM4ARNgZtd7RTIWw9lOuXZSuBHzR1FlYziYHEO4";

app.controller('indexCtrl',  function($scope){
		$scope.titre = "PowerCI services !!";

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
		.when('/findRoles', {
			templateUrl : 'templates/roles/findRole.html',
			controller : 'findRoleController'
		})
		.when('/detailRole/:id', {
			templateUrl : 'templates/roles/detailRole.html',
			controller : 'detailRoleController'
		})
		.when('/addRole', {
			templateUrl : 'templates/roles/addRole.html',
			controller : 'addRoleController'
		})
		.when('/editRole/:id', {
			templateUrl : 'templates/roles/editRole.html',
			controller : 'editRoleController'
		})
		.when('/deleteRole/:id', {
			templateUrl : 'templates/roles/showRoles.html',
			controller : 'deleteRoleController'
		})

		// Group route
		.when('/showGroups', {
			templateUrl : 'templates/groups/showGroups.html',
			controller : 'showGroupsController'
		})
		// .when('/findGroups', {
		// 	templateUrl : 'templates/groups/findGroup.html',
		// 	controller : 'findGroupController'
		// })
		// .when('/detailGroup/:id', {
		// 	templateUrl : 'templates/groups/detailGroup.html',
		// 	controller : 'detailGroupController'
		// })
		// .when('/addGroup', {
		// 	templateUrl : 'templates/groups/addGroup.html',
		// 	controller : 'addGroupController'
		// })
		// .when('/editGroup/:id', {
		// 	templateUrl : 'templates/groups/editGroup.html',
		// 	controller : 'editGroupController'
		// })
		// .when('/deleteGroup/:id', {
		// 	templateUrl : 'templates/groups/showGroups.html',
		// 	controller : 'deleteGroupController'
		//})

		// Board instance route
		.when('/showBoardInstances', {
			templateUrl : 'templates/board_instances/showBoardInstances.html',
			controller : 'showBoardInstancesController'
		})
		.when('/detailBoardInstance/:id', {
			templateUrl : 'templates/board_instances/detailBoardInstance.html',
			controller : 'detailBoardInstanceController'
		})
		.when('/addBoardInstance', {
			templateUrl : 'templates/board_instances/addBoardInstance.html',
			controller : 'addBoardInstanceController'
		})
		.when('/findBoardInstances', {
			templateUrl : 'templates/board_instances/findBoardInstance.html',
			controller : 'findBoardInstanceController'
		})
		/*
		.when('/editBoardInstance/:id', {
			templateUrl : 'templates/board_instances/editBoardInstance.html',
			controller : 'editBoardInstanceController'
		})
		.when('/deleteBoardInstance/:id', {
			templateUrl : 'templates/board_instances/showBoardInstances.html',
			controller : 'deleteBoardInstanceController'
		})*/
	 	.otherwise({redirectTo : '/'});
 }]);

 
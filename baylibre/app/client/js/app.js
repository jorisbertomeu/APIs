var app = angular.module('app', ['ngRoute']);

app.controller('indexCtrl',  function($scope){
		$scope.titre = "Users service !!";

});

 app.config(['$routeProvider', function($routeProvider) {

	// $httpProvider.defaults.useXDomain = true;
 //  	delete $httpProvider.defaults.headers.common['X-Requested-With'];


	$routeProvider
		.when('/showUsers', {
			templateUrl : 'showUsers.html',
			controller : 'showUsersController'
		})
		.when('/addUser', {
			templateUrl : 'addUser.html',
			controller : 'addUserController'
		})
	//.when('/editUsers/:id', {
	// 		templateUrl : 'editUser.html',
	// 		controller : 'editUserController'
	// 	})
	 	.otherwise({redirectTo : '/'});
 }]);

 app.controller('showUsersController', function($scope, $http){
		$scope.contenu = "show all users :";

		// Call get all users service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/users',
	            dataType: 'jsonp',
	            headers: {'Authorization': 'Y1TIM4ARNgZtd7RTIWw9lOuXZSuBHzR1FlYziYHEO3'}
	         }).then(function(response) {

			$scope.users = response.data.details;
			console.log($scope.users);


		});
	});

app.controller('addUserController', function($scope, $http){
	$scope.contenu = "Add User :";
	$scope.user = {};
	$scope.userFirstName;

	var formdata = new FormData();
    $scope.getTheFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            formdata.append(key, value);
        });
    };

    // NOW UPLOAD THE FILES.
    $scope.saveUser = function (user) {

    	console.log(user);

        var request = {
            method: 'POST',
            url: 'http://localhost:8080/users',
            headers: {
            	'Content-Type': 'application/json',
                'Authorization': 'Y1TIM4ARNgZtd7RTIWw9lOuXZSuBHzR1FlYziYHEO3'
            },
		    data: user
        };

        // SEND THE FILES.
        $http(request)
            .success(function (d) {
                console.log(d);
            })
            .error(function (e) {
            	console.log(e);
            });
        }
});


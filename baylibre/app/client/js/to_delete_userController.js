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

app.controller('editUserController', function($scope, $http, $routeParams){
	$scope.contenu = "Edit User :";

	$scope.user = {};
	// Call get all users service
	$http({
            method: 'GET',
            url: 'http://localhost:8080/users/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': 'Y1TIM4ARNgZtd7RTIWw9lOuXZSuBHzR1FlYziYHEO3'}
         }).success(function(response) {
         	console.log(response);
			$scope.user = response.details;
		 }).error(function (e) {
            	console.log(e);
            });

         console.log("user 1 : ");
         console.log($scope.user);

	var formdata = new FormData();
    $scope.getTheFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            formdata.append(key, value);
        });
    };

    // NOW UPLOAD THE FILES.
    $scope.saveUser = function (user) {

    	console.log("user 2 : ");
    	console.log(user);

        var request = {
            method: 'POST',
            url: 'http://localhost:8080/users/',
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

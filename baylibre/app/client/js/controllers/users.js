app.controller('showUsersController', function($scope, $http){
		$scope.contenu = "show all users :";

		// Call get all users service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/users',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	console.log(response);
			$scope.users = response.data.details;


		});
});

 app.controller('findUserController', function($scope, $http, $routeParams){
	$scope.contenu = "Find users :";

    $scope.findUser = function (requestString) {
    	// Call find users service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/users/find/' + requestString,
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	console.log(response);
			$scope.users = response.data.details;
		});
    }
});

app.controller('detailUserController', function($scope, $http, $routeParams){
		$scope.contenu = "Detail user :";
		$scope.message = "";

		// Call get all users service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/user/' + $routeParams.id,
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	console.log(response);
			$scope.user = response.data.details;
			$scope.message = response.data.message;

		});
});

app.controller('addUserController', function($scope, $http, $location){
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
            url: 'http://localhost:8080/user/',
            headers: {
            	'Content-Type': 'application/json',
                'Authorization': temp_token
            },
		    data: user
        };

        // SEND THE FILES.
        $http(request)
            .success(function (response) {
                $scope.user = {};
                $location.path('/detailUser/' + response.details._id);
            })
            .error(function (e) {
            	console.log(e);
            });
        }
});

app.controller('editUserController', function($scope, $http, $routeParams, $location){
    $scope.contenu = "Edit User :";

	$scope.user = {};
	// Call get all users service
	$http({
            method: 'GET',
            url: 'http://localhost:8080/user/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).success(function(response) {
         	console.log(response);
			$scope.user = response.details;
		}).error(function (e) {
            	console.log(e);
        });

	var formdata = new FormData();
    $scope.getTheFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            formdata.append(key, value);
        });
    };

    // NOW UPLOAD THE FILES.
    $scope.saveUser = function (user) {
        var request = {
            method: 'PUT',
            url: 'http://localhost:8080/user/' + $routeParams.id,
            headers: {
            	'Content-Type': 'application/json',
                'Authorization': temp_token
            },
		    data: user
        };

        // SEND THE FILES.
        $http(request)
            .success(function (d) {
                console.log(d);
                console.log("location : ");
                $location.path('/detailUser/' + $routeParams.id);
            })
            .error(function (e) {
            	console.log(e);
            });
        }
});

app.controller('deleteUserController', function($scope, $http, $routeParams){
	$scope.contenu = "show all users :";
	$scope.message = "";

	// Call delete user
	$http({
            method: 'DELETE',
            url: 'http://localhost:8080/user/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
         	$scope.message =  response.data.message;
         	console.log(response);
		});

    // Call get all users
	$http({
            method: 'GET',
            url: 'http://localhost:8080/users',
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
			$scope.users = response.data.details;
		});
});


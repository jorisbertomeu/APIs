// Show all roles
app.controller('showRolesController', function($scope, $http){
		$scope.contenu = "show roles :";
		$scope.actions_selected = {};

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/roles?full=true',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.roles = response.data.details;


		});
});

// Get role detail
app.controller('detailRoleController', function($scope, $http, $routeParams){
		$scope.contenu = "show role :";

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/role/' + $routeParams.id + '?full=true',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.role = response.data.details;


		});
});


//Find role controller
 app.controller('findRoleController', function($scope, $http){
	$scope.contenu = "Find roles :";

    $scope.findRole = function (requestString) {
    	// Call find roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/roles/find?requestString=' + requestString,
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	console.log(response);
			$scope.roles = response.data.details;
		});
    }
});

// Edit Role service
app.controller('editRoleController', function($scope, $http, $routeParams, $location){
		$scope.contenu = "Update role :";

		$scope.actions_selected = [];
		$scope.actions_list = {};

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/role/' + $routeParams.id + '?full=true',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	echo(response.data);
			$scope.role = response.data.details;
			$scope.role.actions_list.forEach(function(action) {
				$scope.actions_selected.push(action._id);
			});
		});

	         // Call get all actions service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/actions',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.actions_list = response.data.details;

		});

	         // toggle actions selection
		  $scope.toggleSelection = function toggleSelection(actionId) {
		    var idx = $scope.actions_selected.indexOf(actionId);

		    // is currently selected
		    if (idx > -1) {
		      $scope.actions_selected.splice(idx, 1);
		    }

		    // is newly selected
		    else {
		      $scope.actions_selected.push(actionId);
		    }
		  };

		 $scope.saveRole = function (role) {
	    	role.actions_list = $scope.actions_selected;

	    	var request = {
            method: 'PUT',
            url: 'http://localhost:8080/role/' + $routeParams.id,
            headers: {
            	'Content-Type': 'application/json',
                'Authorization': temp_token
            },
		    data: role
        };

        // SEND THE FILES.
        $http(request)
            .success(function (d) {
                console.log(d);
                $location.path('/detailRole/' + $routeParams.id);
            })
            .error(function (e) {
            	console.log(e);
            });
        }

});

// Add ROle service
app.controller('addRoleController', function($scope, $http, $location){

		$scope.contenu = "Add role :";
		$scope.role = {};
		$scope.actions_selected = [];
		$scope.actions_list = {};

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/actions',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.actions_list = response.data.details;

		});


	    $scope.saveRole = function (role) {
	    	role.actions_list = $scope.actions_selected;
	    	console.log(role);

	    	var request = {
            method: 'POST',
            url: 'http://localhost:8080/role/',
            headers: {
            	'Content-Type': 'application/json',
                'Authorization': temp_token
            },
		    data: role
        };

        // SEND THE FILES.
        $http(request)
            .success(function (response) {
                $scope.role = {};
                $location.path('/detailRole/' + response.details._id);
            })
            .error(function (e) {
            	console.log(e);
            });
        }

	     // toggle selection for a given role by name
		  $scope.toggleSelection = function toggleSelection(actionId) {
		    var idx = $scope.actions_selected.indexOf(actionId);

		    // is currently selected
		    if (idx > -1) {
		      $scope.actions_selected.splice(idx, 1);
		    }

		    // is newly selected
		    else {
		      $scope.actions_selected.push(actionId);
		    }
		  };
});

app.controller('deleteRoleController', function($scope, $http, $routeParams){
	$scope.contenu = "show roles :";
	$scope.message = "";

	// Call delete user
	$http({
            method: 'DELETE',
            url: 'http://localhost:8080/role/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
         	$scope.message =  response.data.message;
         	console.log(response);
		});


		

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/roles?full=true',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.roles = response.data.details;


		});
});

function echo(String) {
	console.log(String);
}
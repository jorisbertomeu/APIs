// Show all board instances
app.controller('showBoardInstancesController', function($scope, $http){
		$scope.contenu = "show roles :";

		// Call get all board instances service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/board_instances/',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.boardInstances = response.data.details;


		});
});


// Get Board instance details
app.controller('detailBoardInstanceController', function($scope, $http, $routeParams){
		$scope.contenu = "Show board instance details :";

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/board_instance/' + $routeParams.id + '?full=true',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.boardInstance = response.data.details;


		});
});

// Add new board instance
app.controller('addBoardInstanceController', function($scope, $http, $location){

	$scope.contenu = "Add Board instance :";
	$scope.boardInstance = {};

	$scope.boardInstance.customer_id ="576d46649643f69d1e000001";
	$scope.boardInstance.lab_id ="576d3ca34e533e251d000002";
	$scope.boardInstance.board_id ="576d099e1788e75d13000001";

    $scope.saveBoardInstance = function (boardInstance) {
    	echo(boardInstance);
    	var request = {
        method: 'POST',
        url: 'http://localhost:8080/board_instance/',
        headers: {
        	'Content-Type': 'application/json',
            'Authorization': temp_token
        },
	    data: boardInstance
    };

    // SEND THE FILES.
    $http(request)
        .success(function (response) {
            $location.path('/detailBoardInstance/' + response.details._id);
        })
        .error(function (e) {
        	console.log(e);
        });
    }
});

/*
//Find role controller
 app.controller('findRoleController', function($scope, $http, $routeParams){
	$scope.contenu = "Find roles :";

    $scope.findRole = function (requestString) {
    	echo ('http://localhost:8080/roles/find/' + requestString);
    	// Call find users service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/roles/find/' + requestString,
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	console.log(response);
			$scope.roles = response.data.details;
		});
    }
});


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
			echo($scope.actions_selected);
		});

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

		 $scope.saveRole = function (role) {
	    	role.actions_list = $scope.actions_selected;
	    	console.log(role);

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

*/

function echo(String) {
	console.log(String);
}
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

//Find role controller
 app.controller('findBoardInstanceController', function($scope, $http){
	$scope.contenu = "Find board instances :";

    $scope.findBoardInstance = function (requestString) {
    	// Call find board instances service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/board_instances/find?requestString=' + requestString,
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
	         	console.log(response);
			$scope.boardInstances = response.data.details;
		});
    }
});

// Edit board instance controller
app.controller('editBoardInstanceController', function($scope, $http, $routeParams, $location){
	$scope.contenu = "Update board instance :";

	$scope.boardInstance = {};

	// Call get all roles service
	$http({
            method: 'GET',
            url: 'http://localhost:8080/board_instance/' + $routeParams.id + '?full=true',
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
				$scope.boardInstance = response.data.details;
		 });


	 $scope.saveBoardInstance = function (boardInstance) {

    	var request = {
        method: 'PUT',
        url: 'http://localhost:8080/board_instance/' + $routeParams.id,
        headers: {
        	'Content-Type': 'application/json',
            'Authorization': temp_token
        },
	    data: boardInstance
    };

    // SEND THE FILES.
    $http(request)
        .success(function (d) {
            console.log(d);
            $location.path('/detailBoardInstance/' + $routeParams.id);
        })
        .error(function (e) {
        	console.log(e);
        });
    }
});

// Delete board instance 
app.controller('deleteBoardInstanceController', function($scope, $http, $routeParams){
	$scope.contenu = "show board instances :";
	$scope.message = "";

	// Call delete board instance
	$http({
            method: 'DELETE',
            url: 'http://localhost:8080/board_instance/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
         	$scope.message =  response.message;
         	console.log(response);
		});

		// Call get all boar instances service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/board_instances',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.boardInstances = response.data.details;
		});
});


function echo(String) {
	console.log(String);
}
app.controller('showRolesController', function($scope, $http){
		$scope.contenu = "show roles :";

		// Call get all roles service
		$http({
	            method: 'GET',
	            url: 'http://localhost:8080/roles?full=true',
	            dataType: 'jsonp',
	            headers: {'Authorization': temp_token}
	         }).then(function(response) {
                console.log(response);
			$scope.roles = response.data;


		});
});


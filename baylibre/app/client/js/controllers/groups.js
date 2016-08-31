// Show all groups
app.controller('showGroupsController', function($scope, $http){
        $scope.contenu = "show groups :";

        // Call get all groups service
        $http({
                method: 'GET',
                url: 'http://localhost:8080/groups/',
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
             }).then(function(response) {
                console.log(response);
            $scope.groups = response.data.details;


        });
});

//Find Group controller
 app.controller('findGroupsController', function($scope, $http){
    $scope.contenu = "Find groups :";

    $scope.findGroup = function (requestString) {
        // Call find groups service
        $http({
                method: 'GET',
                url: 'http://localhost:8080/group/find/' + requestString,
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
             }).then(function(response) {
                console.log(response);
            $scope.groups = response.data.details;
        });
    }
});

// Detail group controller
app.controller('detailGroupController', function($scope, $http, $routeParams){
        $scope.contenu = "show group :";

        // Call get group service
        $http({
                method: 'GET',
                url: 'http://localhost:8080/group/' + $routeParams.id + '?full=true',
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
             }).then(function(response) {
                console.log(response);
            $scope.group = response.data.details;


        });
});

// Add Group controller
app.controller('addGroupController', function($scope, $http, $location){

        $scope.contenu = "Add group :";
        $scope.group = {};

        $scope.saveGroup = function (group) {

            var request = {
            method: 'POST',
            url: 'http://localhost:8080/group/',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': temp_token
            },
            data: group
        };

        // SEND THE FILES.
        $http(request)
            .success(function (response) {
                $location.path('/detailGroup/' + response.details._id);
            })
            .error(function (e) {
                console.log(e);
            });
        }
});

// Delete group controller
app.controller('deleteGroupController', function($scope, $http, $routeParams, $location){
    $scope.contenu = "show roles :";
    $scope.message = "";

    // Call delete group
    $http({
            method: 'DELETE',
            url: 'http://localhost:8080/group/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            console.log(response);
            $location.path('/showGroups/');
        });

});

// Users manager controller
app.controller('usersManagerController', function($scope, $http, $routeParams, $location, $route){
    $scope.contenu = "Users manager :";
    $scope.message = "";
    $scope.group = {};
    $scope.list_roles = [];
    $scope.list_add_usres = [];

    // Call delete group
    $http({
            method: 'GET',
            url: 'http://localhost:8080/group/' + $routeParams.id + '?full=true',
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            console.log(response);
            $scope.group = response.data.details;
            echo($scope.group.list_roles);
            $scope.group.list_roles.forEach(function(role){
                if(null != role)
                    $scope.list_roles.push(role);
            });

        });

    // Remove user from the group
    $scope.removeUserFromGroup = function (userId){
        // Call delete group
        $http({
            method: 'DELETE',
            url: 'http://localhost:8080/group/user_role',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': temp_token
            },
            data: {'group_id': $scope.group._id, 'user_id': userId}
        }).then(function(response) {
            console.log(response);
            $route.reload();
        });

    };

    // Add User

    $("button#addUser").click(function(){

        $("div#addUser").toggle(500);
    });
    $scope.findUser = function (requestString) {
        // Call find users service
        $http({
                method: 'GET',
                //  get list users without role in group
                url: 'http://localhost:8080/users/find/' + requestString + '?not=true&id_group=' + $scope.group._id,
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
             }).then(function(response) {
                console.log(response);
                $scope.users = response.data.details;
                if($scope.users.length == 0) 
                    $scope.messageUser = "User not found!";
                else
                    $scope.messageUser = "";
                $scope.defaultRole = "---Please select---";
        });
    }

    $scope.addUsersSelection = function(userId) {
        var idx = $scope.list_add_usres.indexOf(userId);
        // is currently selected
        if (idx > -1) {
            $scope.list_add_usres.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.list_add_usres.push(userId);
          if($('select#'+ userId).val() == "?") {
                $('select#'+ userId).css( "background-color", "red" );
            } else {
                $('select#'+ userId).css( "background-color", "green" );
            }
        }
    }

    $scope.changed = function(userId){
        if($scope.list_add_usres.indexOf(userId) > -1)
            if($('select#'+ userId).val() == "?") {
                    $('select#'+ userId).css( "background-color", "red" );
                } else {
                    $('select#'+ userId).css( "background-color", "green" );
                }
    }

    $scope.saveGroup = function (group) {
        $location.path('/detailGroup/' + group._id);
    };

    $scope.saveUsers = function(){

        var error = false;
        $scope.list_add_usres.forEach(function(roleSelect) {
            if($('select#'+ roleSelect).val() == "?") {
                $('select#'+ roleSelect).css( "background-color", "red" );
                error = true;
            } else {
                $('select#'+ roleSelect).css( "background-color", "green" );
            }
        });        
        if(!error) {
                $scope.list_add_usres.forEach(function(userRole) {
                $scope.group.users_role.push({user: userRole, role: $('select#'+ userRole).val()})
            });

            // Call update group
            $http({
                    method: 'PUT',
                    url: 'http://localhost:8080/group/' + $routeParams.id ,
                    dataType: 'jsonp',
                    headers: {'Authorization': temp_token},
                    data: $scope.group
            }).then(function(response) {
                echo(response);
                $route.reload();
            });



        } else 
            {
                $scope.message = "You must select a role for every selected user!"
            }
    };

    // Add new Role
    $scope.actions_list = null;
    $scope.actions_selected = [];
    $("button#addRole").click(function(){
        if($scope.actions_list == null) {
            // Call get all roles service
            $http({
                method: 'GET',
                url: 'http://localhost:8080/actions',
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
            }).then(function(response) {
                $scope.actions_list = response.data.details;

            });
        }

        $("div#addRole").toggle(500);
    });

    // toggle actions selection
    $scope.toggleActionSelection = function toggleSelection(actionId) {
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
        $scope.group.list_roles.push(role);
        updateGroup($scope.group);
    }

    function updateGroup(group){
        // Call update group
        $http({
                method: 'PUT',
                url: 'http://localhost:8080/group/' + $routeParams.id ,
                dataType: 'jsonp',
                headers: {'Authorization': temp_token},
                data: group
        }).then(function(response) {
            echo(response);
            $route.reload();
        });
    }

});

// Roles manager controller
app.controller('rolesManagerController', function($scope, $http, $routeParams, $route, $location){
    $scope.contenu = "Roles manager :";
    $scope.message = "";
    $scope.actions_selected = [];
    $scope.roles_selected = [];
    
    // Call group service
    $http({
            method: 'GET',
            url: 'http://localhost:8080/group/' + $routeParams.id + '?roles=true',
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
            console.log(response);
            $scope.group = response.data.details;
            if(null != $scope.group.list_roles && $scope.group.list_roles.length > 0) {
                $scope.group.list_roles.forEach(function(role) {
                    if(role != null) {
                        $scope.roles_selected.push(role._id);
                    }
                });
            }
        });

    // toggle roles selection
    $scope.toggleRoleSelection = function toggleSelection(roleId) {
         var idx = $scope.roles_selected.indexOf(roleId);
        // is currently selected
        if (idx > -1) {
          $scope.roles_selected.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.roles_selected.push(roleId);
        }

        echo($scope.roles_selected);
    };



    // Add new Role
    $scope.actions_list = null;
    $("button#addRole").click(function(){
        if($scope.actions_list == null) {
            // Call get all roles service
            $http({
                method: 'GET',
                url: 'http://localhost:8080/actions',
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
            }).then(function(response) {
                $scope.actions_list = response.data.details;

            });
        }

        $("div#addRole").toggle(500);
    });

    // toggle actions selection
    $scope.toggleActionSelection = function toggleSelection(actionId) {
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
        if(null == $scope.group.list_roles) {
            $scope.group.list_roles = [];
        }
        role.actions_list = $scope.actions_selected;
        $scope.group.list_roles.push(role);
        updateGroup($scope.group);
        $route.reload();
    }
    $scope.saveGroup = function (group) {
        updateGroup(group);
        $location.path('/detailGroup/' + group._id);
    };

    function updateGroup(group){
        echo('update group :');
        echo(group);
        // Call update group
        $http({
                method: 'PUT',
                url: 'http://localhost:8080/group/' + $routeParams.id ,
                dataType: 'jsonp',
                headers: {'Authorization': temp_token},
                data: group
        }).then(function(response) {
            echo(response);
        });
    }
});



/*




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




*/

function echo(String) {
    console.log(String);
}
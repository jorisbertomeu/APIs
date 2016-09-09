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
                url: 'http://localhost:8080/group/find?requestString=' + requestString,
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
                echo(response);
                $location.path('/detailGroup/' + response.details._id);
            })
            .error(function (e) {
                console.log(e);
            });
        }
});
// Edit Group controller
app.controller('editGroupController', function($scope, $http, $routeParams, $location){

        $scope.contenu = "Edit group :";
        $scope.group = {};

        // Call service
        $http({
            method: 'GET',
            url: 'http://localhost:8080/group/' + $routeParams.id,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            console.log(response);
            $scope.group = response.data.details;
        });


    $scope.saveGroup = function (group) {
            var request = {
            method: 'PUT',
            url: 'http://localhost:8080/group/'+ $routeParams.id,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': temp_token
            },
            data: group
        };

        // SEND THE FILES.
        $http(request)
            .success(function (response) {
                echo(response);
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
    $scope.list_users_roles = [];
    $scope.list_add_usres = [];
    $scope.list_selects_role = [];

    // Call service
    $http({
            method: 'GET',
            url: 'http://localhost:8080/group/' + $routeParams.id + '?full=true',
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            console.log(response);
            $scope.group = response.data.details;
            if(null != $scope.group.users_role) {
                    if($scope.group.users_role.length > 0)
                        $scope.users_finded = $scope.group.users_role;
                    $scope.group.users_role.forEach(function(userRole) {
                    $scope.list_add_usres.push(userRole.user._id);
                });
            }
        });

        // echo($scope.list_selects_role);

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
        $scope.group.new_role = role;
        echo($scope.group);
        updateGroup($scope.group, $http, $routeParams._id);
        $route.reload();
    }

    $scope.saveGroup = function (group) {
        updateGroup($scope.group, $http, $routeParams._id);
        $location.path('/detailGroup/' + group._id);
    };
    // Add User
    $("button#addUser").click(function(){
        $("div#addUser").toggle(500);
    });

    $scope.addUsersSelection = function(userId) {
        var idx = $scope.list_add_usres.indexOf(userId);
        if (idx > -1) {
            $scope.list_add_usres.splice(idx, 1);
            $('select#'+ userId).val('');
            $('select#'+ userId).css( "background-color", "rgb(221, 221, 221)" );
        } else {
          $scope.list_add_usres.push(userId);
          if($('select#'+ userId).val() == "") {
                $('select#'+ userId).css( "background-color", "red" );
            } else {
                $('select#'+ userId).css( "background-color", "green" );
            }
        }
        echo($scope.list_add_usres);
    }

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

    $scope.changed = function(userId){
            
        if($('select#'+ userId).val() == "") {
            if($scope.list_add_usres.indexOf(userId) > -1) {
                $('select#'+ userId).css( "background-color", "red" );
            } else {
                $('select#'+ userId).css( "background-color", "rgb(221, 221, 221)" );
            }
        } else {
            if($scope.list_add_usres.indexOf(userId) == -1) {
                $('select#'+ userId).css( "background-color", "red" );
            } else {
                $('select#'+ userId).css( "background-color", "green" );
            }
        }
    }

    $scope.findUser = function(requestString) {
        // Call get all roles service
        $http({
            method: 'GET',
            url: 'http://localhost:8080/groups/find_users_roles?group_id=' + $scope.group._id + "&requestString=" + requestString + "&in=true",
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            echo(response);
            if(null != response.data.details) {
                echo(response.data.details);
                $scope.users_finded = response.data.details;
            } else {
                $scope.users_finded = [];
            }
        });
    }

    $scope.findUsers = function(requestString) {
        // Call get all roles service
        $http({
            method: 'GET',
            url: 'http://localhost:8080/groups/find_users_roles?group_id=' + $scope.group._id + "&requestString=" + requestString + "&in=false",
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            echo(response);
            if(null != response.data.details) {
                echo(response.data.details);
                $scope.list_users_finded = response.data.details;
                if($scope.list_users_finded.length > 0) {
                    $scope.defaultRole = {}
                    $scope.defaultRole._id="";
                    $scope.defaultRole.title="--please select--";
                    $scope.group.list_roles.unshift($scope.defaultRole)
                }
            } else {
                $scope.list_users_finded = [];
            }
        });
    }

    $scope.saveUsers = function(){
        var error = false;
        $scope.list_add_usres.forEach(function(roleSelect) {
            if($('select#'+ roleSelect).val() == "") {
                $('select#'+ roleSelect).css( "background-color", "red" );
                error = true;
            } else {
                $('select#'+ roleSelect).css( "background-color", "green" );
            }
        });        
        if(!error) {
                echo('update group :');
                echo($scope.group);
                $scope.list_add_usres.forEach(function(user) {
                    if($scope.group.list_roles.map(function(element) { return element.user;}).indexOf(user) == -1);
                        if (null != $('select#'+ user).val() && $('select#'+ user).val() != 'undefined' && $('select#'+ user).val() != "") 
                            $scope.group.users_role.push({user: user, role: $('select#'+ user).val()});
                });
                echo($scope.group);
                $scope.group.list_roles = getListRolesId($scope.group);
                $scope.group.users_role = getListUsersRolesId($scope.group);

                echo($scope.group);
                // Call update group
                $http({
                        method: 'PUT',
                        url: 'http://localhost:8080/group/' + $scope.group._id ,
                        dataType: 'jsonp',
                        headers: {'Authorization': temp_token},
                        data: $scope.group
                }).then(function(response) {
                    echo(response);
                });
                $route.reload();


            
        } else 
            {
                $scope.message = "You must select a role for every selected user!"
            }
    };

    

});

// Roles manager controller
app.controller('rolesManagerController', function($scope, $http, $routeParams, $route, $location){
    $scope.contenu = "Roles manager :";
    $scope.message = "";
    $scope.actions_selected = [];
    $scope.roles_selected = [];
    echo($routeParams.id);
    // Call group service
    $http({
            method: 'GET',
            url: 'http://localhost:8080/group/' + $routeParams.id + '?full=true',
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
    $scope.list_roles_not_in_group = [];
    $("button#addRole").click(function(){
        if($scope.list_roles_not_in_group.length == 0) {
            // Call get all roles service
            $http({
                method: 'GET',
                url: 'http://localhost:8080/roles/group?group_id=' + $scope.group._id + "&in=false",
                dataType: 'jsonp',
                headers: {'Authorization': temp_token}
            }).then(function(response) {
                echo(response);
                $scope.list_roles_not_in_group = response.data.details;
                if($scope.list_roles_not_in_group.length > 0) {
                    $scope.new_selected_role = $scope.list_roles_not_in_group[0]._id;
                }
            });
        }
        $("div#addRole").toggle(500);
    });

    $("button#newRole").click(function(){
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
        
        $("div#newRole").toggle(500);
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

    $scope.findRole = function(requestString) {
        // Call get all roles service
        $http({
            method: 'GET',
            url: 'http://localhost:8080/roles/group?group_id=' + $scope.group._id + "&requestString=" + requestString,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
        }).then(function(response) {
            echo(response);
            $scope.group.list_roles = response.data.details;
        });
    }

    $scope.saveRole = function () {
        $scope.group.list_roles.push($scope.new_selected_role);
        updateGroup($scope.group, $http, $routeParams._id);
        $route.reload();
    }

    $scope.saveNewRole = function (role) {
        role.actions_list = $scope.actions_selected;
        $scope.group.new_role = role;
        updateGroup($scope.group, $http, $routeParams._id);
        $route.reload();
    }


    $scope.saveGroup = function (group) {
        updateGroup(group, $http, $routeParams._id);
        $location.path('/detailGroup/' + group._id);
    };
});

// Board instance manager controller
app.controller('boardInstancesManagerController', function($scope, $http, $routeParams, $route, $location){

    $scope.board_instance_selected = [];
    // Call group service
    $http({
            method: 'GET',
            url: 'http://localhost:8080/group/' + $routeParams.id + '?full=true',
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
            console.log(response);
            $scope.group = response.data.details;
            if(null != $scope.group.board_instances && $scope.group.board_instances.length > 0) {
                $scope.group.board_instances.forEach(function(boardInstance) {
                    if(boardInstance != null) {
                        $scope.board_instance_selected.push(boardInstance._id);
                    }
                });
            }
        });

         

    $("button#addBoardInstance").click(function(){           
        $("div#addBoardInstance").toggle(500);
    });

    // toggle actions selection
    $scope.toggleBoardInstanceSelection = function toggleSelection(boardInstanceId) {
         var idx = $scope.board_instance_selected.indexOf(boardInstanceId);
        // is currently selected
        if (idx > -1) {
          $scope.board_instance_selected.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.board_instance_selected.push(boardInstanceId);
        }
    };

    $scope.saveNewBoardInstance = function (boardInstance) {

        if(null != $scope.image2)
            boardInstance.picture = $scope.image2.resized.dataURL

        boardInstance.customer_id ="576d46649643f69d1e000001";
        boardInstance.lab_id ="576d3ca34e533e251d000002";
        boardInstance.board_id ="576d099e1788e75d13000001";

        echo('board_instance :')
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
                echo(response);
                $scope.group.board_instances.push(response.details._id);
                updateGroup($scope.group, $http, $routeParams._id);
                $location.path('/detailGroup/' + $scope.group._id);
            })
            .error(function (e) {
                console.log(e);
            });
    };

    $scope.saveGroup = function (group) {
        group.board_instances = $scope.board_instance_selected;
        updateGroup(group, $http, $routeParams._id);
        $location.path('/detailGroup/' + group._id);
    };


});

// Board instance manager controller
app.controller('boardInstancesDetailsController', function($scope, $http, $routeParams, $route, $location){
    $scope.board_instance_role_selected = [];
    // Call group service
    $http({
            method: 'GET',
            url: 'http://localhost:8080/group/board_instance_details?group_id=' + $routeParams.id_group + '&board_instance_id=' + $routeParams.id_board_instance,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token}
         }).then(function(response) {
            console.log(response);
            $scope.group = response.data.details.group;
            $scope.board_instance = response.data.details.board_instance;
            $scope.list_users_roles = response.data.details.list_users_roles;
            if($scope.list_users_roles != null && $scope.list_users_roles.length > 0) {
                $scope.list_users_roles.forEach(function(element) {
                    $scope.board_instance_role_selected.push(element._id);
                })
            }
        });

         

    $("button#addBoardInstance").click(function(){           
        $("div#addBoardInstance").toggle(500);
    });

    // toggle actions selection
    $scope.toggleBoardInstanceRoleSelection = function toggleSelection(userRoleId) {
         var idx = $scope.board_instance_role_selected.indexOf(userRoleId);
        // is currently selected
        if (idx > -1) {
          $scope.board_instance_role_selected.splice(idx, 1);
        }

        // is newly selected
        else {
          $scope.board_instance_role_selected.push(userRoleId);
        }
    };

    $scope.saveNewBoardInstance = function (boardInstance) {

        boardInstance.customer_id ="576d46649643f69d1e000001";
        boardInstance.lab_id ="576d3ca34e533e251d000002";
        boardInstance.board_id ="576d099e1788e75d13000001";

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
                echo(response);
                $scope.group.board_instances.push(response.details._id);
                updateGroup($scope.group, $http, $routeParams.id_group);
                $location.path('/detailGroup/' + $scope.group._id);
            })
            .error(function (e) {
                console.log(e);
            });
    };

    $scope.saveGroup = function (group) {
        echo($scope.board_instance_role_selected);
        $scope.group.user_board_instance_role = $scope.board_instance_role_selected;
        updateGroup($scope.group, $http, $routeParams.id_group);
        $location.path('/detailGroup/' + $scope.group._id);
    };


});

// Update group function
function updateGroup(group, $http, group_id){

    echo('update group :');
    echo(group);
    group.list_roles = getListRolesId(group);
    group.users_role = getListUsersRolesId(group);
    echo(group);
    // Call update group
    $http({
            method: 'PUT',
            url: 'http://localhost:8080/group/' + group._id ,
            dataType: 'jsonp',
            headers: {'Authorization': temp_token},
            data: group
    }).then(function(response) {
        echo(response);
    });
}

// Mapping list roles Ids
function getListRolesId(group) {
    var list_roles = [];
    group.list_roles.forEach(function(role){
            if(null != role) {
                if(null != role._id){
                    if(role._id != "") 
                        list_roles.push(role._id);
                }
                else
                    list_roles.push(role);
            }
        });
    return list_roles;
}

// Mapping list users roles Ids
function getListUsersRolesId(group) {
    var list_users_roles = [];
    group.users_role.forEach(function(userRole){
            if(null != userRole && null != userRole.user && null != userRole.role) {
                if(null != userRole.user._id && null != userRole.role._id) {
                    if(userRole.role._id != "")
                        list_users_roles.push({'user': userRole.user._id, 'role': userRole.role._id});
                } else if(userRole.user != "" && userRole.role != "") 
                    list_users_roles.push({'user': userRole.user, 'role': userRole.role});
            }
        });
    return list_users_roles;
}

// echo :)
function echo(String) {
    console.log(String);
}
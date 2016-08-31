var temp_token = "Y1TIM4ARNgZtd7RTIWw9lOuXZSuBHzR1FlYziYHEO4";
var app = angular.module('app', ['ngRoute', 'imageuploadDemo'])
	.controller('indexCtrl',  function($scope){
		$scope.titre = "PowerCI services !!";

	})
	.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {

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
		.when('/findGroups', {
			templateUrl : 'templates/groups/findGroup.html',
			controller : 'findGroupsController'
		})
		.when('/detailGroup/:id', {
			templateUrl : 'templates/groups/detailGroup.html',
			controller : 'detailGroupController'
		})
		.when('/addGroup', {
			templateUrl : 'templates/groups/addGroup.html',
			controller : 'addGroupController'
		})
		// .when('/editGroup/:id', {
		// 	templateUrl : 'templates/groups/editGroup.html',
		// 	controller : 'editGroupController'
		// })
		.when('/deleteGroup/:id', {
			templateUrl : 'templates/groups/showGroups.html',
			controller : 'deleteGroupController'
		})
		.when('/groupRolesManager/:id', {
			templateUrl : 'templates/groups/rolesManager.html',
			controller : 'rolesManagerController'
		})
		.when('/groupUsersManager/:id', {
			templateUrl : 'templates/groups/usersManager.html',
			controller : 'usersManagerController'
		})
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
		.when('/editBoardInstance/:id', {
			templateUrl : 'templates/board_instances/editBoardInstance.html',
			controller : 'editBoardInstanceController'
		})
		.when('/deleteBoardInstance/:id', {
			templateUrl : 'templates/board_instances/showBoardInstances.html',
			controller : 'deleteBoardInstanceController'
		})
	 	.otherwise({redirectTo : '/'});
 }])
/*
app.directive('image', function($q) {
        'use strict'

        var URL = window.URL || window.webkitURL;

        var getResizeArea = function () {
            var resizeAreaId = 'fileupload-resize-area';

            var resizeArea = document.getElementById(resizeAreaId);

            if (!resizeArea) {
                resizeArea = document.createElement('canvas');
                resizeArea.id = resizeAreaId;
                resizeArea.style.visibility = 'hidden';
                document.body.appendChild(resizeArea);
            }

            return resizeArea;
        }

        var resizeImage = function (origImage, options) {
            var maxHeight = options.resizeMaxHeight || 300;
            var maxWidth = options.resizeMaxWidth || 250;
            var quality = options.resizeQuality || 0.7;
            var type = options.resizeType || 'image/jpg';

            var canvas = getResizeArea();

            var height = origImage.height;
            var width = origImage.width;

            // calculate the width and height, constraining the proportions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round(height *= maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round(width *= maxHeight / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            //draw image on canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(origImage, 0, 0, width, height);

            // get the data from canvas as 70% jpg (or specified type).
            return canvas.toDataURL(type, quality);
        };

        var createImage = function(url, callback) {
            var image = new Image();
            image.onload = function() {
                callback(image);
            };
            image.src = url;
        };

        var fileToDataURL = function (file) {
            var deferred = $q.defer();
            var reader = new FileReader();
            reader.onload = function (e) {
                deferred.resolve(e.target.result);
            };
            reader.readAsDataURL(file);
            return deferred.promise;
        };


        return {
            restrict: 'A',
            scope: {
                image: '=',
                resizeMaxHeight: '@?',
                resizeMaxWidth: '@?',
                resizeQuality: '@?',
                resizeType: '@?',
            },
            link: function postLink(scope, element, attrs, ctrl) {

                var doResizing = function(imageResult, callback) {
                    createImage(imageResult.url, function(image) {
                        var dataURL = resizeImage(image, scope);
                        imageResult.resized = {
                            dataURL: dataURL,
                            type: dataURL.match(/:(.+\/.+);/)[1],
                        };
                        callback(imageResult);
                    });
                };

                var applyScope = function(imageResult) {
                    scope.$apply(function() {
                        //console.log(imageResult);
                        if(attrs.multiple)
                            scope.image.push(imageResult);
                        else
                            scope.image = imageResult; 
                    });
                };


                element.bind('change', function (evt) {
                    //when multiple always return an array of images
                    if(attrs.multiple)
                        scope.image = [];

                    var files = evt.target.files;
                    for(var i = 0; i < files.length; i++) {
                        //create a result object for each file in files
                        var imageResult = {
                            file: files[i],
                            url: URL.createObjectURL(files[i])
                        };

                        fileToDataURL(files[i]).then(function (dataURL) {
                            imageResult.dataURL = dataURL;
                        });

                        if(scope.resizeMaxHeight || scope.resizeMaxWidth) { //resize image
                            doResizing(imageResult, function(imageResult) {
                                applyScope(imageResult);
                            });
                        }
                        else { //no resizing
                            applyScope(imageResult);
                        }
                    }
                });
            }
        };
    });

 */
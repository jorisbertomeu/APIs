// Mapped Objects
var Group 			= require('../models/group');
var User  			=   require('../models/user');
var Board_instance 	= require('../models/board_instance');
var Role 	= require('../models/role');
var UseRoleBoardInstance = require('../models/user_role_board_instances');

//Mongoose
var mongoose = require('mongoose');
var Schema		= mongoose.Schema, ObjectId = Schema.ObjectId;

// Import Modules
var Promise = require('bluebird');

// Utils
var Utils = require('../utils');
var groupServices = require('../services/groupServices');

// Param's var
var param_name				= "name";
var param_group_id			= "group_id";
var param_user_id			= "user_id";
var param_role_id			= "role_id";
var param_board_instance_id	= "board_instance_id";
var param_title 			= "title";
var param_actions_list 		= "actions_list";

// Create group function
exports._create_group = function(req, res) {

    // Check user token
    Utils.checkToken(req, res, false).then(function(result){
    	if(!result) {
    		Utils.sendUnauthorized(req, res);
    		return;
    	}
    	// Check request parms
    	missing = Utils.checkFields(req.body, [param_name]);
    	if(missing.length !=0) 
    		return Utils.sendMissingParams(res, missing);

    	Promise.any([groupServices.getGroupByName(req.body.name)]).then(function(groups) {
    		if(groups != null && groups.length > 0) 
				return res.send({message: Utils.Constants._MSG_GROUP_NAME_EXIST_, details: "Group name is already used", code: Utils.Constants._CODE_KO_});
			else {

				// Find connected user by token
				Promise.any(Utils.getUserByToken(req)).then(function(user) {
					if(null != user) {
						var group 			= new Group();
					    group.name 		= req.body.name;
				    	group.description 	= req.body.description;

				    	// Find admin role
				    	Role.findOne({title: Utils.Constants._ADMIN_ROLE_TITLE_}, function(err, role) {
							if(err) 
								return Utils.sendError(res, err);
							if (role != null) {
								group.users_role.push({user: user._id, role: role._id});
								Role.find({title: {$in: Utils.Constants._DEFAULT_ROLES_.split(",")}}, function(err, listRoles) {
									if(err)
										Utils.sendError(res, err);
									listRoles.map(function(role){ group.list_roles.push(role._id);});

									// Save object
								    group.save(function(err){
								    	// Check errors
								    	if(err)
								    		return Utils.sendError(res, err);
								    	
								    	// Send ok message
								    	res.json({message: "Group created successfully", details: group, code: Utils.Constants._CODE_OK_});
							    	});
								});
							} else 
								// No group found for this Id
								res.json({message : Utils.Constants._ADMIN_ROLE_TITLE_ + ' role not found!'});
						});
				    	
					} else 
						// No group found for this Id
						res.json({message : 'User not found!'});
		    	});
			}
    	});
    });
};

// Get list of groups
exports._get_groups= function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_get_groups";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			// Get list of groups
			Group.find({}, function(err, groups) {
				// Check err
				if(err) 
					return Utils.sendError(res, err);
				// Send groups
				res.json({message: Utils.Constants._MSG_OK_, details: groups, code: Utils.Constants._CODE_OK_});
			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Get group by Id
exports._get_group = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_get_group";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {
			if(req.query.full == Utils.Constants._TRUE_) {
				// Get group by Id
				Group.findById(req.params.group_id).populate([
						{
							path:'users_role.user', 
							model:'User'
						}, 
						{
							path:'users_role.role'
						}, 
						{
							path: 'list_roles',
						    model: 'Role',
						    populate: 
							{
							    path: 'actions_list',
							    model: 'Action'
						  
							}
						},
						{
							path: 'board_instances'
						},
						{
							path: 'user_board_instance_role'
						}])
					.exec(function(err, group){
						if(err)
							// Send error
							return Utils.sendError(res, err);
						if(group != null) {
							// Send result
							res.json({message: Utils.Constants._MSG_OK_, details: group, code: Utils.Constants._CODE_OK_});
						}
						else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					});

			}else if (req.query.roles == Utils.Constants._TRUE_) {
				// Get group by Id
				Group.findById(req.params.group_id).populate({
							path: 'list_roles',
						    model: 'Role',
							populate: {
							    path: 'actions_list',
							    model: 'Action'
						  
							}})
					.exec(function(err, group){
					if(err)
						// Send error
						return Utils.sendError(res, err);
					if(group != null) {
						// Send result
						res.json({message: Utils.Constants._MSG_OK_, details: group, code: Utils.Constants._CODE_OK_});
					}
					else 
						// No group found for this Id
						res.json({message : 'Group not found!'});
				});

			} else  {

				// Get group by Id
				Group.findById(req.params.group_id, function(err, group){
					if(err)
						// Send error
						return Utils.sendError(res, err);
					if(group != null) 
						// Send result
						res.json({message: Utils.Constants._MSG_OK_, details: group, code: Utils.Constants._CODE_OK_});
					else 
						// No group found for this Id
						res.json({message : 'Group not found!'});
				});
			}
			
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Find groups service
exports._find_group = function(req, res) {
	// Technical title : 
	var tachnical_title = "groups_find_group";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			Group.find({$or :[
								{name: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
								{description: new RegExp('.*' + req.query.requestString + '.*',"i")}
							]
						}, function(err, groups) {
				if (err)
					return Utils.sendError(res, err);

				//Send result
				res.json({message: Utils.Constants._MSG_OK_, details: groups, code: Utils.Constants._CODE_OK_});
			});
		
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

exports._find_user_role_ = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_find_user_role_";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			if(req.query.group_id != null && req.query.group_id != "") {

				// Get group by Id
				Group.findById(req.query.group_id).populate([
						{
							path:'users_role.user', 
							model:'User'
						}, 
						{
							path:'users_role.role'}, {
							path: 'list_roles',
						    model: 'Role',
						    populate: 
							{
							    path: 'actions_list',
							    model: 'Action'
						  
							}
						}])
					.exec(function(err, group){
						if(err)
							// Send error
							return Utils.sendError(res, err);
						if(group != null) {

							var list_users_roles = [];
							var group_list_Users = [];
							var group_list_roles = [];
							var list_Users = [];
							var list_roles = [];


							var getUsersRoles = new Promise(function(resolve, reject) {
												group.users_role.map(function(userRole){
													if(null != userRole) {
														if(null != userRole.user)
													  		group_list_Users.push(userRole.user._id);
													  	if(null != userRole.role)
															group_list_roles.push(userRole.role._id);
													}
												});
												resolve(group);
											});

							if(req.query.in == Utils.Constants._TRUE_) {
						
								Promise.all([getUsersRoles]).then(function() {

									//Promis to get list users with string request
									var getUsersPromise = new Promise(function(resolve, reject) {
												User.find({$and: [{_id: {$in: group_list_Users}}, {
													$or :[
															{username: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
															{first_name: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
															{last_name: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
															{email: new RegExp('.*' + req.query.requestString + '.*',"i")}
														]}
													]}, function(err, users) {
														if(err)
															reject(err);
														list_Users = users.map(function(user) {return user._id.toString();});
														resolve(list_Users);
													});
											});

									//Promis to get list roles with string request
									var getRolesPromise = new Promise(function(resolve, reject) {
												Role.find({$and: [{_id: {$in: group_list_roles}}, {
													$or :[
															{title: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
															{description: new RegExp('.*' + req.query.requestString + '.*',"i")}
														]}
													]}, function(err, roles) {
														if(err)
															reject(err);
														list_roles = roles.map(function(role) {return role._id.toString();});;
														resolve(list_roles);
													})
											});
									Promise.all([getUsersPromise, getRolesPromise]).then(function() {
												group.users_role.map(function(userRole) {
													if(null != userRole) {
														if((null != userRole.user && list_Users.indexOf(userRole.user._id.toString()) > -1) || (null != userRole.role && list_roles.indexOf(userRole.role._id.toString()) > -1)) {
															list_users_roles.push(userRole);
														}
													}
												});

											// Send result
											res.json({message: Utils.Constants._MSG_OK_, details: list_users_roles, code: Utils.Constants._CODE_OK_});
												
									});

								});

							} else if(req.query.in == Utils.Constants._FALSE_) {

								Promise.all([getUsersRoles]).then(function() {

									//Promis to get list users with string request
									User.find({$and: [{_id: {$not: {$in: group_list_Users}}}, {
										$or :[
												{username: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
												{first_name: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
												{last_name: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
												{email: new RegExp('.*' + req.query.requestString + '.*',"i")}
											]}
										]}, function(err, users) {
											if(err)
												Utils.sendError(res, err);
											res.json({message: Utils.Constants._MSG_OK_, details: users, code: Utils.Constants._CODE_OK_});
										});
								});

							} else 
								// No group found for this Id
								res.json({message : 'users not found!'});
						} else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					});
			} else 
				// No group found for this Id
				res.json({message : 'Group not found!'});
				
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Update group
exports._update_group = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_update_group";

	// Check if user have permission
	Utils.isAuthorized(req, req.params.group_id, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			var update = false;

			// Get group by Id
			Group.findById(req.params.group_id, function(err, group){
				if(err)
					return Utils.sendError(res, err);
				else if (group != null) {

					var newRolePromise = new Promise(function(resolve, reject) {
						// Check if add new role
						if(req.body.new_role != null) {
					    	var role 			= new Role();
							// Mpping request params
						    role.title 			= req.body.new_role.title;
					    	role.description 	= req.body.new_role.description;
					    	role.actions_list 	= req.body.new_role.actions_list;
					    	role.group_id 		= group._id;
				    		role.save(function(err){
						    	// Check errors
						    	if(err)
						    		reject(err);
						    	// Send ok message
						    	req.body.list_roles.push(role._id);
						    	resolve(true);
					    	});
						} else
							resolve(true);
					});

					

					Promise.any([newRolePromise]).then(function(result) {

						// Check if group name is used
						if(group.name.localeCompare(req.body.name) != 0) {
							if(Utils.isNotEmpty(req.body.name)) {
								Promise.any([groupServices.getGroupByName(req.body.name)]).then(function(groups) {
						    		if(groups != null && groups.length > 0 && groups.indexOf(group) == -1) 
										return res.send({message: Utils.Constants._MSG_GROUP_NAME_EXIST_, details: "Group name is already used", code: Utils.Constants._CODE_KO_});
								});
								group.name = req.body.name;
								update = true;
							} 
						} 

						if(req.body.new_role != null) {
							// Check request parms
					    	missing = Utils.checkFields(req.body.new_role, [param_title, param_actions_list]);
					    	if(missing.length !=0) 
					    		return Utils.sendMissingParams(res, missing);
						}


						// Mapping description
						if(Utils.isNotEmpty(req.body.description)) {
							group.description = req.body.description;
							update = true;
						}

						if(null != req.body.users_role && req.body.users_role.length > 0) {
							group.users_role = [];
							req.body.users_role.map(
									function(userRole) { 
											if(null != userRole.user && userRole.user != "" && null != userRole.role && userRole.role != "")
												group.users_role.push(new Object(
													{'user': mongoose.Types.ObjectId(userRole.user.toString()), 'role': mongoose.Types.ObjectId(userRole.role.toString())}));
										}
									);
							update = true;
						}

						if(null != req.body.board_instances && req.body.board_instances.length > 0) {
							group.board_instances = req.body.board_instances;
							update = true;
						}
						if(null != req.body.user_board_instance_role) {
							group.user_board_instance_role = req.body.user_board_instance_role;
							update = true;
						}

						// Mapping list of roles
						if(req.body.list_roles != null && req.body.list_roles.length > 0) {
							group.list_roles.forEach(function(roleId) {
								if(null != roleId) {
									if(req.body.list_roles.indexOf(roleId.toString()) == -1) {
										group.list_roles.splice(roleId, 1);
										Group.find({$and: [{$not: {_id: group._id}}, {list_roles : roleId},{$not: {group_id: null}}]}, function(err, groups) {
											if(groups.length == 0) {
												Role.remove({_id: roleId}, function(err, role) {
													echo("Role " + roleId + " Successfully removed!");
												});
											}
										});
									} 							
								}
							});
							group.list_roles = req.body.list_roles;
							update = true;
						}

						group.save(function(err) {
								if(err)
									return Utils.sendError(res, err);
								res.json({message: 'Group updated!', details: group, code: Utils.Constants._CODE_OK_});	
							});
						})
					
					
				} else 
				// No customer found for this group
				res.json({message : 'Group not found'});

			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
	
};

// Delete group
exports._delete_group = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_delete_group";

	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			// Get group by Id
			Group.findById(req.params.group_id, function(err, group){
				if(err)
					return Utils.sendError(res, err);
				else if(group != null) {

					var deleteGroupsFromRoles = new Promise(function(resolve, reject) {
					UseRoleBoardInstance.remove({_id :{$in: group.user_board_instance_role}}, function(err) {
						if(err) reject(err);
						resolve(true);
					});
				});

				Promise.all([deleteGroupsFromRoles]).then(function(rslt) {
					// delete group
					Group.remove({_id : req.params.group_id }, function(err) {
						if(err)
							return Utils.sendError(res, err);
						res.json({message: 'Group saccessfully deleted!', details: {}, code: Utils.Constants._CODE_OK_});
					});
				});

					
				} else 
					// No group found for this Id
					res.json({message : 'Group not found!'});
			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Add user to group
exports._user_role = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_user_role";

	// Check request parms
	missing = Utils.checkFields(req.body, [param_group_id, param_user_id, param_role_id]);
	if(missing.length !=0) 
		return Utils.sendMissingParams(res, missing);

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {
			// Get group by Id
			Group.findById(req.body.group_id, function(err, group){
				if(err)
					return Utils.sendError(res, err);
				else if(group != null) {
					// Get User by id
					User.findById(req.body.user_id, function(err, user) {
			            if (err)
			                return Utils.sendError(res, err);
			            if(user != null) {
			            	
							// Get role by id
		            		Role.findById(req.body.role_id, function(err, role) {
								if(err)
									return Utils.sendError(res, err);
								// Insert new role
								if(null != role) {

									// Remove old roles if exist
			            			group.users_role.splice({'user': user._id}, 1);

									group.users_role.push({'user': user._id, 'role': role._id});
									// Save update 
									group.save(function(err) {
					            		if(err)
					            			return Utils.sendError(res, err);
					            		// Send success result
					            		res.json({message: 'User add successfully!', details: group, code: Utils.Constants._CODE_OK_});
					            	});
								} else 
					            	// No group found for this Id
									res.json({message : 'Role not foud!'});
			            	});
			            } else 
			            	// No group found for this Id
							res.json({message : 'User not foud!'});
		        	});

				} else 
					// No group found for this Id
					res.json({message : 'Group not found!'});
			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};


// Update group remove user
exports._remove_user = function(req, res) {

	console.log(req.body);

	// Technical title : 
	var tachnical_title = "groups_remove_user";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {


			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id, param_user_id]);
			if(missing.length !=0) 
				return res.send({'error' : "Missing followwing properties : " + missing});


			// Get group by Id
			Group.findById(req.body.group_id, function(err, group){
				if(err)
					return Utils.sendError(res, err);
				else if(group != null) {

					User.findById(req.body.user_id, function(err, user) {
			            if (err)
			                return Utils.sendError(res, err);
			            if(user != null) {
							//Remove role if exist
		            		group.users_role.splice({user: req.body.user_id}, 1);

							// Save update 
							group.save(function(err) {
			            		if(err)
			            			return Utils.sendError(res, err);
			            		// Send success result
			            		res.json({message: 'User removed successfully!', details: group, code: Utils.Constants._CODE_OK_});
			            	});
						} else {
							res.json({message : 'User not foud!'});
						}
							
		        	});

				} else 
					// No group found for this Id
					res.json({message : 'Group not found!'});
			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Add board instance to group
exports._add_board_instance = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_add_board_instance";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id, param_board_instance_id]);
			if(missing.length !=0) 
				return res.send({'error' : "Missing followwing property : " + missing});

			Board_instance.findById(req.body.board_instance_id, function(err, board_instance){
				if(err)
					return Utils.sendError(res, err);
				if(board_instance != null) {
					// Get group by Id
					Group.findById(req.body.group_id, function(err, group){
						if(err)
							return Utils.sendError(res, err);
						else if(group != null) {

							Promise.any(Utils.getUserByToken(req)).then(function(user) {

								Role.findOne({title: Utils.Constants._ADMIN_ROLE_TITLE_}, function(err, role) {
									if(err)
										return Utils.sendError(res, err);
									userRole = new UseRoleBoardInstance();
									userRole.user_id = user._id;
									userRole.role_id = role._id;
									userRole.board_instance_id = board_instance._id;

									userRole.save(function(err) {
										if(err)
											return Utils.sendError(res, err);
										group.user_board_instance_role.push(userRole._id);
										group.board_instances.push(req.body.board_instance_id);

										// Save object
									    group.save(function(err){
									    	// Check errors
									    	if(err)
									    		return Utils.sendError(res, err);
									    	
									    	// Send ok message
									    	res.json({message: 'Board instance add seccessfully', details: group, code: Utils.Constants._CODE_OK_});
								    	});

									})
								});

					    	});

						} else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					});
				} else 
					res.send({message: 'Board instance not found'});

			});
	
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Detail board instance
exports._board_instance_details_ = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_board_instance_details_";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			if(Utils.isNotEmpty(req.query.board_instance_id)) {
				Board_instance.findById(req.query.board_instance_id, function(err, board_instance){
					if(err)
						return Utils.sendError(res, err);
					if(board_instance != null) {

						if(Utils.isNotEmpty(req.query.group_id)) {

							// Get group by Id
							Group.findById(req.query.group_id, function(err, group) {
								if(err)
									return Utils.sendError(res, err);
								else if(group != null) {
									echo(group.user_board_instance_role);
									UseRoleBoardInstance.find({$and: [{_id: {$in: group.user_board_instance_role}}, {board_instance_id: req.query.board_instance_id}]})
									.populate([{path: 'user_id'}, {path: 'role_id'}]).exec(function(err, result) {
										if(err)
											Utils.sendError(res, err);

										// Send result
										res.json({message: Utils.Constants._MSG_OK_, details: {'group': group, 'board_instance': board_instance, 'list_users_roles': result}, code: Utils.Constants._CODE_OK_});
									});

								} else 
									// No group found for this Id
									res.json({message : 'Group not found!'});
							});
						} else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					} else 
						res.send({message: 'Board instance not found'});

				});
			} else 
				res.send({message: 'Board instance not found'});
	
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Remove board instance from group
exports._remove_board_instance = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_remove_board_instance";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id, param_board_instance_id]);
			if(missing.length !=0) 
				return res.send({'error' : "Missing followwing properties : " + missing});
			Board_instance.findById(req.params.board_instance_id, function(err, board_instance){

				if(err)
					return Utils.sendError(res, err);
				if(board_instance != null) {

					// Get group by Id
					Group.findById(req.body.group_id, function(err, group){
						if(err)
							return Utils.sendError(res, err);
						else if(group != null) {

							// Remove list of board instance roles
							UseRoleBoardInstance.find({_id: {"$in": group.user_board_instance_role}, board_instance_id : req.params.board_instance_id}, function(err, roles) {
								roles.forEach(function(item){
									group.user_board_instance_role.splice(item._id, 1);
								}) ;

								// Remove board instance from list of group board instances
								group.board_instances.splice(param_board_instance_id);

								// Save group
							    group.save(function(err){
							    	// Check errors
							    	if(err)
							    		return Utils.sendError(res, err);

							    	// Romove board instance roles in group
							    	roles.forEach(function(item){
							    		item.remove(function(err) {
										  	if(err) return Utils.sendError(res, err);
										  });
							    	});
							    	// Send ok message
							    	res.json({message: 'Board instance removed seccessfully', details: {}, code: Utils.Constants._CODE_OK_});
						    	});	
						    });	

						} else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					});
				} else 
					res.send({message: 'Board instance not found'});

			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Add user in board instance to group
exports._add_user_board_instance = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_add_user_board_instance";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id, param_board_instance_id, param_user_id, param_role_id]);
			if(missing.length !=0) 
				return res.send({'error' : "Missing followwing properties : " + missing});

			// Check if board indtance exist 
			Board_instance.findById(req.body.board_instance_id, function(err, board_instance){

				if(err)
					return Utils.sendError(res, err);
				if(board_instance != null) {

					// Get group by Id
					Group.findById(req.body.group_id, function(err, group){
						if(err)
							return Utils.sendError(res, err);
						else if(group != null) {

							Promise.any(Utils.getUserByToken(req)).then(function(user) {

								if(Utils.isAdmin(req.body.group_id, user._id)) {
									// Remove old roles
									Promise.any([Utils.removeUserRoleBoardInstance(group.user_board_instance_role, req.body.user_id, req.body.board_instance_id)]).then(function(role) {
										Role.findById(req.body.role_id, function(err, dbRole){
											if(err)
												return Utils.sendError(res, err);

											// Crate new role
											userRole = new UseRoleBoardInstance();

											// Mapping data
											userRole.user_id = req.body.user_id;
											userRole.role_id = req.body.role_id;
											userRole.board_instance_id = req.body.board_instance_id;

											// Save object
											userRole.save(function(err) {
												if(err)
													return Utils.sendError(res, err);
												group.user_board_instance_role.push(userRole._id);

												// Save object
											    group.save(function(err){
											    	// Check errors
											    	if(err)
											    		return Utils.sendError(res, err);
											    	
											    	// Send ok message
											    	res.json({message: 'User role add seccessfully in board instance'});
										    	});

											});
										});
									});

								} else {
									res.json({message:"you don't have permission to access on this service !!"});
								}
					    	});

						} else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					});
				} else 
					res.send({message: 'Board instance not found'});

			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};


// Remove board instance user role
exports._remove_user_board_instance = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_remove_user_board_instance";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id, param_board_instance_id, param_user_id]);
			if(missing.length !=0) 
				return res.send({'error' : "Missing followwing properties : " + missing});

			Board_instance.findById(req.body.board_instance_id, function(err, board_instance){

				if(err)
					return Utils.sendError(res, err);
				if(board_instance != null) {

					// Get group by Id
					Group.findById(req.body.group_id, function(err, group){
						if(err)
							return Utils.sendError(res, err);
						else if(group != null) {

							Promise.any(Utils.getUserByToken(req)).then(function(user) {

								if(Utils.isAdmin(req.body.group_id, user._id)) {
									User.findById(req.body.user_id, function(err, userDb){
										if(err) return Utils.sendError(res, err);
										if(userDb != null) {
											UseRoleBoardInstance.find({_id: {"$in" : group.user_board_instance_role}, user_id: userDb._id}, function(err, listRoles) {
												if(err) res.log(err);

												listRoles.forEach(function(role){
													group.user_board_instance_role.splice(role._id, 1);
													role.remove(function(err){
														return Utils.sendError(res, err);
													});

													group.save(function(err) {
														return Utils.sendError(res, err);
													res.send({message: "User removed from board instance seccessfully."});
													});
												});

											})

										} else 
											res.send({message:"User not found"});

									});

								} else {
									res.json({message:"you don't have permission to access on this service !!"});
								}
					    	});

						} else 
							// No group found for this Id
							res.json({message : 'Group not found!'});
					});
				} else 
					res.send({message: 'Board instance not found'});

			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

function echo(String) {
    console.log(String);
}
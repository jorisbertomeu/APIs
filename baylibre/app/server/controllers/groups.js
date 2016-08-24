// Mapped Objects
var Group 			= require('../models/group');
var User  			=   require('../models/user');
var Board_instance 	= require('../models/board_instance');
var Role 	= require('../models/role');
var UseRoleBoardInstance = require('../models/user_role_board_instance');

//Mongoose
var mongoose = require('mongoose');
var Schema		= mongoose.Schema, ObjectId = Schema.ObjectId;

// Import Modules
var Promise = require('bluebird');

// Utils
var Utils = require('../utils');



// Param's var
var param_name				= "name";
var param_group_id			= "group_id";
var param_user_id			= "user_id";
var param_role_id			= "role_id";
var param_board_instance_id	= "board_instance_id";

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

    	Promise.any([Utils.getGroupByName(req.body.name)]).then(function(groups) {
    		if(groups != null && groups.length > 0) 
				return res.send({message: Utils.Constants._MSG_GROUP_NAME_EXIST_, details: "Group name is already used", code: Utils.Constants._CODE_KO_});
			else {

				Promise.any(Utils.getUserByToken(req)).then(function(user) {
					if(null != user) {
						var group 			= new Group();
					    group.name 		= req.body.name;
				    	group.description 	= req.body.description;
				    	if(req.body.users.length > 0) {
				    		req.body.users.forEach(function(userRole) {
				    			// CHeck if role exist
				    			Role.findById(userRole.role, function(err, reqRole) {
				    				if(err) 
				    					return Utils.sendError(res, err);
				    				// Check if user exist
				    				User.findById(userRole.user, function(err, reqUser) {
				    					if(err) 
				    						return Utils.sendError(res, err);
				    					group.users.push({user: reqUser._id, role: reqRole._id});

				    					Role.findOne({title: Utils.Constants._ADMIN_ROLE_TITLE_}, function(err, role) {
											if(err) 
												return Utils.sendError(res, err);
											if (role != null) {
												group.users.push({user: user._id, role: role._id});

											    // Save object
											    group.save(function(err){
											    	// Check errors
											    	if(err)
											    		return Utils.sendError(res, err);
											    	
											    	// Send ok message
											    	res.json({message: 'Group created!'});
										    	});
											} else 
												// No group found for this Id
												res.json({message : 'Role not found!'});
										});
				    				})
				    			});
				    			
				    		});
				    	}
				    	
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

			// Check user token
			Utils.checkToken(req,res,true).then(function(result){
				// Send error for a bad tokens 
				if(!result) {
					Utils.sendUnauthorized(req, res);
					return;
				}
				// Get list of groups
				Group.find({}, function(err, groups) {
					// Check err
					if(err) 
						return Utils.sendError(res, err);
					// Send groups
					res.json({message: Utils.Constants._MSG_OK_, details: groups, code: Utils.Constants._CODE_OK_});
				});
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

			// Get group by Id
			Group.findById(req.params.group_id, function(err, group){
				if(err)
					// Send error
					return Utils.sendError(res, err);
				if (group != null) {
					// Send result
					res.json(group);
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

// Update group
exports._update_group = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_update_group";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			var update = false;

			// Get group by Id
			Group.findById(req.params.group_id, function(err, group){

				if(err)
					return Utils.sendError(res, err);
				else if (group != null) {

					// Check if group name is used
					if(group.name.localeCompare(req.body.name) != 0) {
						if(Utils.isNotEmpty(req.body.name)) {
							Promise.any([Utils.getGroupByName(req.body.name)]).then(function(groups) {
					    		if(groups != null && groups.length > 0 && groups.indexOf(group) == -1) 
									return res.send({message: Utils.Constants._MSG_GROUP_NAME_EXIST_, details: "Group name is already used", code: Utils.Constants._CODE_KO_});
							});
						} else {
							group.name = req.body.name;
							update = true;
						}

					} 

					// Mapping description
					if(Utils.isNotEmpty(req.body.description)) {
						group.description = req.body.description;
						update = true;
					}
					
					if(update) {
						// Update group
						group.save(function(err) {
							if(err)
								return Utils.sendError(res, err);
						});
					} 
						
					res.json({message : 'Group updated!'});
					
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
			
					// delete group
					Group.remove({_id : req.params.group_id }, function(err) {
						if(err)
							return Utils.sendError(res, err);
						res.json({message : 'Group saccessfully deleted!'});
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
exports._add_user_role = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_add_user_role";

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
			            	// Remove old roles if exist
			            	group.users.splice({'user': user._id, 'role': req.body.role_id}, 1);

							// Get role by id
		            		Role.findById(req.body.role_id, function(err, role) {
								if(err)
									return Utils.sendError(res, err);
								// Insert new role
								if(null != role) {
									group.users.push({'user': user._id, 'role': role._id});
									// Save update 
									group.save(function(err) {
					            		if(err)
					            			return Utils.sendError(res, err);
					            		// Send success result
					            		res.json({message : 'Role add successfully!'});
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


// Update group
exports._remove_user_role = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_remove_user_role";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id, param_user_id, param_role_id]);
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
							// Get role by id
			            	Role.findById(req.body.role_id, function(err, role) {
								if(err)
									return Utils.sendError(res, err);
								if(null != role) {
									//Remove role if exist
				            		group.users.splice({user: req.body.user_id, role: req.body.role_id}, 1);

									// Save update 
									group.save(function(err) {
					            		if(err)
					            			return Utils.sendError(res, err);
					            		// Send success result
					            		res.json({message : 'Role removed successfully!'});
					            	});
								} else 
									// No role found for this Id
									res.json({message : 'User not foud!'});
							});
			            } else 
			            	// No user found for this Id
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

// Update group
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

								Role.find({title: 'Admin'}, function(err, role) {
									if(err)
										return Utils.sendError(res, err);
									userRole = new UseRoleBoardInstance();
									userRole.user_id = user._id;
									userRole.role_id = role[0]._id;
									userRole.board_instance_id = board_instance._id;

									userRole.save(function(err) {
										if(err)
											return Utils.sendError(res, err);
										group.user_board_role.push(userRole._id);

										// Save object
									    group.save(function(err){
									    	// Check errors
									    	if(err)
									    		return Utils.sendError(res, err);
									    	
									    	// Send ok message
									    	res.json({message: 'Board instance add seccessfully'});
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

// Update group
exports._remove_board_instance = function(req, res) {

	// Technical title : 
	var tachnical_title = "groups_remove_board_instance";

	// Check if user have permission
	Utils.isAuthorized(req, req.body.group_id, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			// Check request parms
			missing = Utils.checkFields(req.body, [param_group_id]);
			if(missing.length !=0) 
				return res.send({'error' : "Missing followwing property : " + missing});
			Board_instance.findById(req.params.board_instance_id, function(err, board_instance){

				if(err)
					return Utils.sendError(res, err);
				if(board_instance != null) {

					// Get group by Id
					Group.findById(req.body.group_id, function(err, group){
						if(err)
							return Utils.sendError(res, err);
						else if(group != null) {

							UseRoleBoardInstance.find({_id: {"$in": group.user_board_role}, board_instance_id : req.params.board_instance_id}, function(err, roles) {
								roles.forEach(function(item){
									group.user_board_role.splice(item._id);
								}) ;
								// Save object
							    group.save(function(err){
							    	// Check errors
							    	if(err)
							    		return Utils.sendError(res, err);

							    	roles.forEach (function(item){
							    		item.remove(function(err) {
										  	if(err) return Utils.sendError(res, err);
										  });
							    	});
							    	// Send ok message
							    	res.json({message: 'Board instance removed seccessfully'});
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

// Update group
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
									Promise.any([Utils.removeUserRoleBoardInstance(group.user_board_role, req.body.user_id, req.body.board_instance_id)]).then(function(role) {
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
												group.user_board_role.push(userRole._id);

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


// Update group
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
											UseRoleBoardInstance.find({_id: {"$in" : group.user_board_role}, user_id: userDb._id}, function(err, listRoles) {
												if(err) res.log(err);

												listRoles.forEach(function(role){
													group.user_board_role.splice(role._id, 1);
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
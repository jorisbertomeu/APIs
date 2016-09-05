// Mapped Objects
var Role 					= require('../models/role');
var Action					=	require('../models/action');
var UserRoleBoaredInstance	=	require('../models/user_role_board_instances');
var UserGroupRoles			=	require('../models/user_group_roles');
var Group 					= require('../models/group');

// Import Modules
var Promise = require('bluebird');

// Utils
var Utils = require('../utils');


// Parm's val
var param_title = "title";
var param_actions_list = "actions_list";

// Create role function
exports._create_role = function(req, res) {
    // Check user token
    Utils.checkToken(req, res, false).then(function(result){
    	if(!result) {
    		Utils.sendUnauthorized(req, res);
    		return;
    	}

    	// Check request parms
    	missing = Utils.checkFields(req.body, [param_title, param_actions_list]);
    	if(missing.length !=0) 
    		return Utils.sendMissingParams(res, missing);

    	Promise.any([Utils.getRoleByTitle(req.body.title)]).then(function(roles) {
    		if(roles != null && roles.length > 0) 
				return res.send({message: Utils.Constants._MSG_GROUP_NAME_EXIST_, details: "Role title is already used", code: Utils.Constants._CODE_KO_});
			else {
				var role 			= new Role();
				// Mpping request params
			    role.title 			= req.body.title;
		    	role.description 	= req.body.description;
		    	role.actions_list 	= req.body.actions_list;
	    		role.save(function(err){
			    	// Check errors
			    	if(err)
			    		res.send(err);
			    	// Send ok message
			    	res.json({message: "Role created successfully", details: role, code: Utils.Constants._CODE_OK_});
		    	});
			}
    	});
    });
};

// Get list of roles
exports._get_roles= function(req, res) {
	// Check user token
	Utils.checkToken(req,res,true).then(function(result){

		// Send error for a bad tokens 
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		if (req.query.full == Utils.Constants._TRUE_) {
			// Get list of roles with actions detail
			Role.find().populate('actions_list')
				.exec(function(err, roles) {
				// Check error
				if(err) 
					res.send(err);
				// Send roles
				res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
			});

		} else {
			// Get list of roles without actions detail
			Role.find({}, function(err, roles) {
				// Check error
				if(err) 
					res.send(err);
				// Send roles
				res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
			});
		}
		
	});
};

// Get role by Id
exports._get_role = function(req, res) {

	// Check user token
	Utils.checkToken(req,res,true).then(function(result){

		// Get role by Id
		if (req.query.full == Utils.Constants._TRUE_) {
			Role.findById(req.params.role_id).populate('actions_list')
				.exec(function(err, role){
				if(err)
					// Send error
					res.send(err);
				// Send result
				res.json({message: Utils.Constants._MSG_OK_, details: role, code: Utils.Constants._CODE_OK_});
			});
		} else {
			Role.findById(req.params.role_id, function(err, role){
				if(err)
					// Send error
					res.send(err);
				// Send result
				res.json({message: Utils.Constants._MSG_OK_, details: role, code: Utils.Constants._CODE_OK_});
			});
		}
	});
};


// Find role service
exports._find_role = function(req, res) {
	// Technical title : 
	var tachnical_title = "roles_find_role";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			Role.find({$or :[
								{title: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
								{description: new RegExp('.*' + req.query.requestString + '.*',"i")}
							]
						}, function(err, roles) {
				if (err)
					return Utils.sendError(res, err);

				//Send result
				res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
			});
		
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};
// Find role by group id service
exports._get_roles_group = function(req, res) {
	// Technical title : 
	var tachnical_title = "roles_get_roles_group";
	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			if(Utils.isNotEmpty(req.query.group_id)) {

				Group.findById(req.query.group_id, function(err, group) {
					if(err)
						return utils.sendError(res, err);
					if(group != null) {
						if(Utils.checkArray(group.list_roles)) {

							if(Utils.isNotEmpty(req.query.requestString)) {

								Role.find({
											$and: [
													{_id: {$in: group.list_roles}},
													{
														$or: [
															{title: new RegExp('.*' + req.query.requestString + '.*',"i")}, 
															{description: new RegExp('.*' + req.query.requestString + '.*',"i")}
														]
													}
												]

											}).populate('actions_list').exec(function(err, roles) {
									if (err)
										return Utils.sendError(res, err);
									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
								});

							} else if(req.query.in == Utils.Constants._TRUE_) {
								Role.find({_id : {$in :group.list_roles}}, function(err, roles) {
									if (err)
										return Utils.sendError(res, err);
									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
								});
							} else if(req.query.in == Utils.Constants._FALSE_) {
								Role.find({$and: [{_id: {$not: {$in: group.list_roles}}}, {group_id: null}]}, function(err, roles) {
									if (err)
										return Utils.sendError(res, err);
									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
								});
							} else {
								Role.find({_id: {$in: group.list_roles}}).populate('actions_list').exec(function(err, roles) {
									if (err)
										return Utils.sendError(res, err);
									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
								});
							}
						} else {
							if(req.query.in == Utils.Constants._TRUE_) {
									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: null, code: Utils.Constants._CODE_OK_});
							} else if(req.query.in == Utils.Constants._FALSE_) {
								Role.find({group_id: null}, function(err, roles) {
									if (err)
										return Utils.sendError(res, err);
									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: roles, code: Utils.Constants._CODE_OK_});
								});
							}
						}


					} else 
						res.json({message: "Group not found", details: null, null: Utils.Constants._CODE_OK_});
				});
			} else 
				res.json({message: Utils.Constants._MSG_OK_, details: null, null: Utils.Constants._CODE_OK_});

		
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

// Update role
exports._update_role = function(req, res) {

	var update = false;

	// Get project by Id
	Role.findById(req.params.role_id, function(err, role){

		if(err)
			res.send(err);
		else if (role != null) {

			// Check if role title is used
			if(Utils.isNotEmpty(req.body.title)) {
				if(role.title.localeCompare(req.body.title) != 0) {
					Promise.any([Utils.getRoleByTitle(req.body.title)]).then(function(roles) {
			    		if(roles != null && roles.length > 0 && roles.indexOf(role) == -1) 
							return res.send({message: Utils.Constants._MSG_ROLE_TITLE_EXIST_, details: "Role title is already used", code: Utils.Constants._CODE_KO_});
					});
				} 
				role.title = req.body.title;
				update = true;

			} 

			// Mapping description
			if(Utils.isNotEmpty(req.body.description)) {
				role.description = req.body.description;
				update = true;
			}
			if(null != req.body.actions_list && req.body.actions_list.length > 0) {
				role.actions_list 	= req.body.actions_list;
				update = true;
			}
			
			if(update) {
				// Update project
				role.save(function(err) {
					if(err)
						res.send(err);
				});
			} 
				
			res.json({message : 'Role updated!'});
			
		} else 
		// No customer found for this project
		res.json({message : 'Role not found'});

	});
	
};


// Delete role
exports._delete_role = function(req, res) {
	// Get Role by Id
	Role.findById(req.params.role_id, function(err, role){
		if(err)
			res.send(err);
		else if(role != null) {

			var deleteRoleFromBoardInstances = new Promise(function(resolve, reject) {
				UserRoleBoaredInstance.remove({role_id : role._id}, function(err) {
					if(err) reject(err);
					resolve(true);
				});
			});

			var deleteRoleFromGroups = new Promise(function(resolve, reject) {
				UserGroupRoles.remove({role_id : role._id}, function(err) {
					if(err) reject(err);
					resolve(true);
				});
			});

			Promise.all([deleteRoleFromBoardInstances, deleteRoleFromGroups]).then(function(rslt) {
				// delete role
				Role.remove({_id : req.params.role_id }, function(err) {
					if(err)
						res.send(err);
					res.json({message : 'Role saccessfully deleted!'});
				});
			});

		} else 
			// No role found for this Id
			res.json({message : 'Role not found!'});
	});
};

function echo(string) {
	console.log(string);
}
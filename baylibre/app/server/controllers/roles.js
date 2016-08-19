// Mapped Objects
var Role = require('../models/role');
var Action	=	require('../models/action');

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
    		return Utils.sendMissingParams(missing);

    	Promise.any([Utils.getRoleByTitle(req.body.title)]).then(function(roles) {
    		if(roles != null && roles.length > 0) 
				return res.send({message: Utils.Constants._MSG_GROUP_NAME_EXIST_, details: "Role title is already used", code: Utils.Constants._CODE_KO_});
			else {

				// Mpping request params
		    	var role 			= new Role();
			    role.title 			= req.body.title;
		    	role.description 	= req.body.description;
		    	role.actions_list 	= req.body.actions_list;

			    // Save object
			    role.save(function(err){
			    	// Check errors
			    	if(err)
			    		res.send(err);
			    	
			    	// Send ok message
			    	res.json({message: 'Role created!'});
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
			console.log(Utils.Constants.user_create_user);
			// Get list of roles with actions detail
			Role.find().populate('actions_list')
				.exec(function(err, roles) {
				// Check error
				if(err) 
					res.send(err);
				// Send roles
				res.json(roles);
			});

		} else {
			// Get list of roles without actions detail
			Role.find({}, function(err, roles) {
				// Check error
				if(err) 
					res.send(err);
				// Send roles
				res.json(roles);
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
				res.json(role);
			});
		} else {
			Role.findById(req.params.role_id, function(err, role){
				if(err)
					// Send error
					res.send(err);
				// Send result
				res.json(role);
			});
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
	// Get project by Id
	Role.findById(req.params.role_id, function(err, role){
		if(err)
			res.send(err);
		else if(role != null) {
	
			// delete project
			Role.remove({_id : req.params.role_id }, function(err) {
				if(err)
					res.send(err);
				res.json({message : 'Role saccessfully deleted!'});
			});
		} else 
			// No project found for this Id
			res.json({message : 'Role not found!'});
	});
};
// Mapped Objects
var Project = require('../models/project');
var Customer = require('../models/customer');
var BoardInstance = require('../models/board_instance');
var TestSuite = require('../models/test_suite');
var Lab = require('../models/lab');
var Board = require('../models/board');
var Constants = require('../constants');

// Modules
var Promise = require('bluebird');

// Utils
var Utils = require('../utils');

// Create poject function
exports._postL1 = function(req, res) {
	

    // Check user token
    Utils.checkToken(req, res, false).then(function(result){
    	if(!result) {
    		Utils.sendUnauthorized(req, res);
    		return;
    	}

    	// Check request parms
    	missing = Utils.checkFields(req.body, ["name", "description"]);
    	if(missing.length !=0) 
    		return res.send({'error' : "Missing followwing properties : " + missing});

    	// Mpping request params
    	var project = new Project();
    	project.description 		= req.body.description;
	    project.customer_id 		= req.body.customer_id;
	    project.board_instance_id 	= req.body.board_instance_id;
	    project.name 				= req.body.name;
	    project.test_suite_id		= req.body.test_suite_id;
	    project.created_on 			= Date.now() / 1000 | 0;

	    // Save object
	    project.save(function(err){
	    	// Check errors
	    	if(err)
	    		res.send(err);
	    	
	    	// Send ok message
	    	res.json({message: 'Project created!'});
    	});
    });
    
};

// Get list of porjects
exports._getL1= function(req, res) {
	// Check user token
	Utils.checkToken(req,res,true).then(function(result){
		// Send error for a bad tokens 
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		// Get list of projects
		Project.find({}, function(err, projects) {
			// Check the response
			if(err) 
				res.send(err);
			// Send response
			res.json(projects);
		});
	});
};

// Get porject by Id
exports._getL2 = function(req, res) {
	// Get project by Id
	Project.findById(req.params.project_id, function(err, project){
		if(err)
			// Send error
			res.send(err);
		if (project != null) {
			// Result object
			var result = project.toObject();

			// Fetch all objects
			if (req.query.full == Constants._TRUE_) {

				// Promise to get board instance
				var boardInstancePromis = new Promise(function(resolve, reject) {

				// Get board instance by project board instance id
				BoardInstance.findById(project.board_instance_id, function(err, board_instance) {
					if(err)
						reject(err);

					// Get Lab by board instance lab id
					Lab.findById(board_instance.lab_id, function(err, lab) {
					var labInstance = board_instance.toObject();
					// Set lab object in board instance object
					labInstance.lab_id = lab;

					// Get Board by Boared instace board id
					Board.findById(board_instance.board_id, function(err, board) {
						labInstance.board_id = board;
								// Send result
							    resolve(labInstance);
							});
						    });
						});
				});

			// Promise to get customer
			var customerPromis = 
				new Promise(function(resolve, reject) {

					// Find customer by project customer id
					Customer.findById(project.customer_id, function(err, customer){
						if(err)
							reject(err);
						// Send result
						resolve(customer.toObject());
					});
				});

			// Execution promises
			Promise.all([customerPromis]).then(function(customerObject) {
					// Check user token authorization
					Utils.checkToken(req, res, false, Utils.getUsersByCustomer(project.customer_id)).then (function(result) {
							if(!result) {
								Utils.sendUnauthorized(req, res);
							}
					});

					// Set customer object in result
					result.customer_id = customerObject;

					Promise.all([boardInstancePromis]).then(function(boardInstanceObj){
						result.board_instance_id = boardInstanceObj;
						// Send result
						res.json(result);
					}).error(function(err) {
					  console.log(err.message); 
					});;
			}).error(function(err) {
				  console.log(err.message);
				});

			// Get project object without fetching objects
			} else {

				// Find customer by project customer id
				Customer.findById(project.customer_id, function(err, customer){
					if(err)
						// Send error
						reject(err);
					if(customer != null) {
						// Check user authorization
						Utils.checkToken(req, res, false, Utils.getUsersByCustomer(project.customer_id)).then (function(token) {
						if(!token) {
							Utils.sendUnauthorized(req, res);
							return;
						}
						// Send result
						res.json(result);
				});

			}
		});
			}
		} else 
			// No project found for this Id
			res.json({message : 'Project not found!'});
	});
};

// Update project
exports._putL2 = function(req, res) {

	// Check request parms
	missing = Utils.checkFields(req.body, ["name", "description"]);
	if(missing.length !=0) 
		return res.send({'error' : "Missing followwing properties : " + missing});
	// Get project by Id
	Project.findById(req.params.project_id, function(err, project){
			if(err)
				res.send(err);
			else if (project != null) {
				// Get custmer by Id
				Customer.findById(project.customer_id, function(err, customer){
					if(err)
						res.send(err);
					// check if customer is not null
					else if(customer != null) {

						Utils.getUsersByCustomer(project.customer_id).then(function(users) {
							// Check user token
							Utils.checkToken(req, res, false, users).then (function(result) {
								if(!result) {
									Utils.sendUnauthorized(req, res);
									return;
								}

								// Mapping params
								if(Utils.isNotEmpty(req.body.name)) {
									project.name = req.body.name;
								}
								if(Utils.isNotEmpty(req.body.description)) {
									project.description = req.body.description;
								}
								if(Utils.isNotEmpty(req.body.customer_id)) {
									project.customer_id = req.body.customer_id;
								}
								if(Utils.isNotEmpty(req.body.board_instance_id)) {
									project.board_instance_id = req.body.board_instance_id;
								}
								if(Utils.isNotEmpty(req.body.test_suite_id)) {
									req.body.test_suite_id = req.body.test_suite_id;
								}

								// Update project
								project.save(function(err) {
									if(err)
										res.send(err);
									res.json({message : 'project updated!'});
								});
							});
						});
					} else 
					// No customer found for this project
					res.json({message : 'Customer not found for this project!'});

				});
			} else 
			// No project found for this Id
			res.json({message : 'Project not found!'});
	});
};

// Update project
exports._deleteL2 = function(req, res) {
	// Get project by Id
	Project.findById(req.params.project_id, function(err, project){
		if(err)
			res.send(err);
		else if(project != null) {
	
			// Get custmer by Id
			Customer.findById(project.customer_id, function(err, customer){
				if(err) 
					res.send(err);
				else if(customer != null) {
					// Check user token
					
					Utils.checkToken(req, res, false, customer.users_id).then (function(result) {
						if(!result) {
							Utils.sendUnauthorized(req, res);
							return;
						}
						// delete project
						project.remove({_id : req.params.project_id }, function(err) {
							if(err)
								res.send(err);
							res.json({message : 'project saccessfully deleted!'});
						});
					});
				} else 
					// No customer found for this project
					res.json({message : 'Customer not found for this project!'});
			});
		} else 
			// No project found for this Id
			res.json({message : 'Project not found!'});
	});
};
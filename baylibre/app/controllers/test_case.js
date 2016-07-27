// Mapped Objects
var Project = require('../models/project');
var TestCase = require('../models/test_case')

// Modules
var Promise = require('bluebird');

// Utils
var Utils = require('../utils');

// Create test case
exports._postL1 = function(req, res) {
	

    // Check user token
    Utils.checkToken(req, res, false).then(function(result){
    	if(!result) {
    		Utils.sendUnauthorized(req, res);
    		return;
    	}

    	// Check request parms
    	missing = Utils.checkFields(req.body, ["status", "title", "description", "target", "trend"]);
    	if(missing.length !=0) 
    		return res.send({'error' : "Missing followwing properties : " + missing});

    	// Mpping request params
    	var testCase = new TestCase();

    	testCase.status 		= req.body.status;
		testCase.title 			= req.body.title;
		testCase.description 	= req.body.description;
		testCase.target 		= req.body.target;
		testCase.current 		= req.body.current;
		testCase.unit 			= req.body.unit;
		testCase.trend 			= req.body.trend;
	    testCase.created_on 			= Date.now() / 1000 | 0;

	    // Save test case object
	    testCase.save(function(err){
	    	// Check errors
	    	if(err)
	    		res.send(err);
	    	
	    	// Send ok message
	    	res.json({message: 'Test case created!'});
    	});
    });
    
};

// Get list tests case
exports._getL1= function(req, res) {
	// Check user token
	Utils.checkToken(req,res,true).then(function(result){
		// Send error for a bad tokens 
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		// Get list of tests case
		TestCase.find({}, function(err, testscase) {
			// Check the response
			if(err) 
				res.send(err);
			// Send response
			res.json(testscase);
		});
	});
};

// Get test case by Id
exports._getL2 = function(req, res) {
	
};

// Update project
exports._postL2 = function(req, res) {

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

						// Check user token
						Utils.checkToken(req, res, false, customer.users_id).then (function(result) {
							if(!result) {
								Utils.sendUnauthorized(req, res);
								return;
							}
							// Mapping params
							project.name = req.body.name;
							project.description = req.body.description;

							// Update project
							project.save(function(err) {
								if(err)
									res.send(err);
								res.json({message : 'project updated!'});
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
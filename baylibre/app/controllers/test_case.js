// Mapped Objects
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

	// Check user token
	Utils.checkToken(req, res, true).then (function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		// Get test case by Id
		TestCase.findById(req.params.test_case_id, function(err, testCase){
			if(err)
				res.send(err);
				// Get result
			res.json(testCase);
		});
	});
};

// Update test case
exports._putL2 = function(req, res) {

	// Check user token
	Utils.checkToken(req, res, true).then (function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}

		// Get test case by Id
		TestCase.findById(req.params.test_case_id, function(err, testCase){
			if(err)
				res.send(err);

			 if (testCase != null) {
				// Mapping params
				if(req.body.status !== undefined && req.body.status != "") {
					testCase.status 		= req.body.status;
				}
				if(req.body.title !== undefined && req.body.title != "") {
					testCase.title 		= req.body.title;
				}
				if(req.body.description !== undefined && req.body.description != "") {
					testCase.description 		= req.body.description;
				}
				if(req.body.target !== undefined && req.body.target != "") {
					testCase.target 		= req.body.target;
				}
				if(req.body.current !== undefined && req.body.current != "") {
					testCase.current 		= req.body.current;
				}
				if(req.body.unit !== undefined && req.body.unit != "") {
					testCase.unit 		= req.body.unit;
				}
				if(req.body.trend !== undefined && req.body.trend != "") {
					testCase.trend 		= req.body.trend;
				}

				// Update test case
				testCase.save(function(err) {
					if(err)
						res.send(err);
					res.json({message : 'Test Case updated!'});
				});
						
			} else 
				res.json({message : 'Test case not found!'});
		});
	});
};

// Update test case
exports._deleteL2 = function(req, res) {

	// Check user token
	Utils.checkToken(req, res, true).then (function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}

		// Get test case by Id
		TestCase.findById(req.params.test_case_id, function(err, testCase){
			if(err)
				res.send(err);
			if(testCase != null) {
				// delete test case
				TestCase.remove({_id : req.params.test_case_id }, function(err, testCase) {
					if(err)
						res.send(err);
					res.json({message : 'test case saccessfully deleted!'});
				});
			} else 
				res.json({message : 'Test case not found!'});
		});

	});
};

// exports.getCustomerByTestCase = function (test_case_id) {
//     return new Promise(function(resolve, reject) {
//         TestSuite.find({tests_case : {"$in" : [test_case_id]}}, function(err, testsSuites) {
//             if(err) 
//                 reject(err);
//             else if(testsSuite != null) {
//                 Project.find({test_suite_id : {"$in" : [testsSuite._id]}}, function(err, project) {
//                     if(err)
//                         reject(err);
//                     else if (project != null) {
//                         Customer.find(project.customer_id, function(err, customer){
//                         	if(err)
//                         		reject(err);
//                         	resolve(customer)
//                         });
//                     }
//                 });
//             } 
//         });

//     });
// };
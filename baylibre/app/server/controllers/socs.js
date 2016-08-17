// Mapping objects
var Socs	=	require('../models/soc');

// Modules
var multer  =   require('multer');


// Utils
var Utils	= require('../utils');

// Create new soc
exports._postL1 	= function(req, res) {

	var socObject = new Socs();

	console.log("Create new soc");
	// Check params
	missing = Utils.checkFields(req.body, ["title", "sub_title", "description"]);
	if(missing.length != 0)
		Utils.sendMisiingParams(res, missing);

	

	// Mapping params
	socObject.title = req.body.title;
	socObject.sub_title = req.body.sub_title;
	socObject.description = req.body.description;
	socObject.logo = req.body.logo;
	socObject.created_on = Date.now() / 1000 | 0;
	socObject.is_new = true;
	socObject.nb_views = 0;
	socObject.board_id = req.body.board_id;
	socObject.test_case_id = req.body.test_case_id;

	socObject.save(function(err) {
		if(err) 
			res.send(err);
		res.json({message: Utils.Constants._MSG_CREATED_, details: socObject, code: Utils.Constants._CODE_CREATED_});

	});

	

};

// Get list of all Socs
exports._getL1 = function(req, res) {
	Utils.checkToken(req, res, true).then(function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		Socs.find({}, function(err, socs) {
			if(err)
				res.send(err)
			res.json({message: Utils.Constants._MSG_OK_, details: socs, code: Utils.Constants._CODE_OK_});
		});
	})
};


// Update Soc
exports._putL2 = function(req, res) {

	Socs.findById(req.params.soc_id, function(err, soc){
		if(err)
			res.send(err)
		var updated = false;
		if(soc != null) {
			// Update inserted params
			if(Utils.isNotEmpty(req.body.title)) {
				soc.title = req.body.title;
				updated = true;
			}
			if(Utils.isNotEmpty(req.body.sub_title)){
				soc.sub_title = req.body.sub_title;
				updated = true;
			}
			if(Utils.isNotEmpty(req.body.description)){
				soc.description = req.body.description;
				updated = true;
			}
			if(Utils.isNotEmpty(req.body.logo)){
				soc.logo = req.body.logo;
				updated = true;
			}
			if(Utils.isNotEmpty(req.body.board_id)){
				soc.board_id = req.body.board_id;
				updated = true;
			}
			if(Utils.isNotEmpty(req.body.test_case_id)){
				soc.test_case_id = req.body.test_case_id;
				updated = true;
			}
			if(updated == true) {
				soc.save(function(err) {
					if(err) 
						res.send(err);
					res.json({message: Utils.Constants._MSG_MODIFIED_, details: soc, code: Utils.Constants._CODE_MODIFIED_});

				});

			} else {
				res.json({message: Utils.Constants._MSG_MODIFIED_, details: "No parametres updated!", code: Utils.Constants._CODE_MODIFIED_});
			}

		} else 
			res.json({message: Utils.Constants._MSG_OK_, details:"Soc not found!",code:_CODE_OK_});
	});
};

// Get soc by id
exports._getL2 = function(req, res) {

	// Utils.checkToken(req, res, true).then(function(result) {
	// 	if(!result) {
	// 		Utils.sendUnauthorized(req, res);
	// 		return;
	// 	}
		Socs.findById(req.params.soc_id, function(err, soc) {
			if(err)
				res.send(err);
			res.json({message: Utils.Constants._MSG_OK_, details: soc, code: Utils.Constants._CODE_OK_});
		});
	// })

};

// Delete soc by ID
exports._deleteL2 = function(req, res) {

	// Check user token
	Utils.checkToken(req, res, true).then (function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		// Get test case by Id
		Socs.findById(req.params.soc_id, function(err, soc){
			if(err)
				res.send(err);
			if(soc != null) {
				// delete soc
				Socs.remove({_id : req.params.soc_id }, function(err, testCase) {
					if(err)
						res.send(err);
					res.json({message: Utils.Constants._MSG_DELETED_, details:"Soc Successfully deleted!",code: Utils.Constants._CODE_DELETED_});

				});
			} else 
				res.json({message: Utils.Constants._MSG_OBJECT_NOT_FOUND_, details:"Soc not found!",code: Utils.Constants._CODE_ARGS_});

		});

	});
};
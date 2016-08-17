// Mapping objects
var Action	=	require('../models/action');

// Utils
var Utils	= require('../utils');

// parm's var
var param_action_id = "action_id";
var param_title = "title";


// Get list of all actions
exports._get_actions = function(req, res) {
	Utils.checkToken(req, res, true).then(function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		Action.find({}, function(err, actions) {
			if(err)
				res.send(err)
			res.json({message: Utils.Constants._MSG_OK_, details: actions, code: Utils.Constants._CODE_OK_});
		});
	})
};

// Get action by id
exports._get_action = function(req, res) {

	Utils.checkToken(req, res, true).then(function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		Action.findById(req.params.soc_id, function(err, action) {
			if(err)
				res.send(err);
			res.json({message: Utils.Constants._MSG_OK_, details: action, code: Utils.Constants._CODE_OK_});
		});
	})

};



// Update Soc
exports._update_action = function(req, res) {

	Utils.checkToken(req, res, true).then(function(result) {
		if(!result) {
			Utils.sendUnauthorized(req, res);
			return;
		}
		// Check request parms
		missing = Utils.checkFields(req.body, [param_action_id, param_title]);
		if(missing.length !=0) 
			return Utils.sendMissingParams(missing);

		Action.findById(req.params.action_id, function(err, action){
			if(err)
				res.send(err)
			if(action != null) {
				Action.find({_id: {"$ne": action._id},title: param_title}, function(err, actionNameExist){
					if(err) res.send(err) ;
					if(actionNameExist != null)
						res.json({message: Utils.Constants._MSG_KO_, details: "Action title is already used!", code: Utils.Constants._CODE_MODIFIED_});
					else {
						var updated = false;
						action.title = param_title;
						action.save(function(err) {
							if(err) res.send(err);
							res.json({message: Utils.Constants._MSG_MODIFIED_, details: "Action title updated", code: Utils.Constants._CODE_MODIFIED_});

						})

					}
				});
			} else 
				res.json({message: Utils.Constants._MSG_OK_, details:"Action not found!",code:_CODE_OK_});		
		});
	});
};
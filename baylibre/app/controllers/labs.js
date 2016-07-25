var Lab = require('../models/lab');
var Board_instance = require('../models/board_instance');
var Promise = require('bluebird');
var Utils = require('../utils');

exports._postL1 = function(req, res) {
    var lab = new Lab();
    var missing;
    
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	missing = Utils.checkFields(req.body, ["name", "lava_url", "short_location", "location_long", "location_lat", "contact", "status"]);
	if (missing.length != 0)
	    return res.send({'error': "Missing followwing properties : " + missing});
	lab.name = req.body.name;
	lab.lava_url = req.body.lava_url;
	lab.short_location = req.body.short_location;
	lab.location_long = req.body.location_long;
	lab.location_lat = req.body.location_lat;
	lab.contact = req.body.contact;
	lab.status = req.body.status;
	    
	lab.save(function(err) {
	    if (err)
		res.send(err);
	    
	    res.json({ message: 'Lab created!' });
	});
    });
};

exports._getL1 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	Lab.find({}, function(err, labs) {
	    if (err)
		res.send(err);
	    Promise.all(labs.map(function(lab) {
		return new Promise(function (resolve, reject) {
		    Board_instance.find({
			lab_id: lab
		    }, function (error, board_instances) {
			if (error) {
			    reject(error);
			    return;
			}
			var r = lab.toObject();
			r.board_instances = Array();
			board_instances.forEach(function(item) {
			    r.board_instances.push(item._id);
			});
			resolve(r);
		    });
		});
	    })).then(function(fullLabs) {
		var o = Array();
		
		res.json(fullLabs);
	    });
	});
    });
};

exports._getL2 = function(req, res) {
    Lab.findById(req.params.lab_id, function(err, lab) {
	if (err)
	    res.send(err);
	res.json(lab);
    });
};

exports._putL2 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	Lab.findById(req.params.lab_id, function(err, lab) { 
	    if (err)
		res.send(err);
	    lab.name = req.body.name;
	    lab.save(function(err) {
		if (err)
		    res.send(err);
		res.json({ message: 'Lab updated!' });
	    });	    
	});
    });
};

exports._deleteL2 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	Lab.remove({
	    _id: req.params.lab_id
	}, function(err, lab) {
	    if (err)
		res.send(err);
	    res.json({ message: 'Successfully deleted' });
	});
    });
};

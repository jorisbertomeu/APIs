var Board_instance 	= require('../models/board_instance');
var Board 			= require('../models/board');
var Customer 		= require('../models/customer');
var Lab 			= require('../models/lab');

var Constants 		= require('../constants');
var Utils 			= require('../utils');

var Promise = require('bluebird');

exports._postL1 = function(req, res) {
    var board_instance = new Board_instance();
    var missing;
    
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	missing = Utils.checkFields(req.body, ["board_id", "label", "customer_id", "lab_id"]);
	if (missing.length != 0)
	    return res.send({'error': "Missing followwing properties : " + missing});
	board_instance.board_id = req.body.board_id;
	board_instance.label = req.body.label;
	board_instance.customer_id = req.body.customer_id;
	board_instance.lab_id = req.body.lab_id;
	board_instance.created_on = Date.now() / 1000 | 0;
	board_instance.save(function(err) {
	    if (err)
		res.send(err);
	    res.json({ message: 'Board instance created!' });
	});
    });
};

exports._getL1 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	Board_instance.find(function(err, board_instances) {
	    if (err)
		res.send(err);
	    res.json(board_instances);
	});
    });
};

exports._getL2 = function(req, res) {
    Board_instance.findById(req.params.board_id, function(err, board_instance) {
		if (err)
		    res.send(err);
		Utils.checkToken(req, res, false, Utils.getUsersByCustomer(board_instance.customer_id)).then(function(result) {
			if (!result) {
			    Utils.sendUnauthorized(req, res);
			    return;
			}

			if(req.query.full == Constants._TRUE_) {
				var result = board_instance.toObject();
				// Promis to get doard
				var boardPromise = new Promise(function(resolve, reject) {
					Board.findById(board_instance.board_id, function(err, board){
						if(err) 
							reject(err);
						result.board_id = board.toObject();
						resolve(result);
					})
				});

				// Promis to get customer
				var customerPromis = new Promise(function (resolve, reject) {
					Customer.findById(board_instance.customer_id, function(err, customer){
						if(err)
							reject(err);
						result.customer_id = customer;
						resolve(result);
					})
				});

				// Promis to get Lab
				var labPromis = new Promise(function(resolve, reject) {
					Lab.findById(board_instance.lab_id, function(err, lab){
						if(err)
							reject(err);

						result.lab_id = lab;
						resolve(result);
					});
				});

				Promise.any([labPromis, boardPromise, customerPromis]).then(function(result) {
					res.json(result);
				});

			// Get object without fetching
			} else 
			res.json(board_instance);
		});
    });
};

exports._putL2 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	Board_instance.findById(req.params.board_id, function(err, board_instance) { 
	    if (err)
		res.send(err);
	    board_instance.name = req.body.name;
	    board_instance.save(function(err) {
		if (err)
		    res.send(err);
		res.json({ message: 'Board instance updated!' });
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
	Board_instance.remove({
	    _id: req.params.board_id
	}, function(err, board) {
	    if (err)
		res.send(err);
	    res.json({ message: 'Successfully deleted' });
	});
    });
};

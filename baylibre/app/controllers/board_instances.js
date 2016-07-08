var Board_instance = require('../models/board_instance');

exports._postL1 = function(req, res) {
    var board_instance = new Board_instance();
	
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
};

exports._getL1 = function(req, res) {
    Board_instance.find(function(err, board_instances) {
	if (err)
	    res.send(err);
	    
	res.json(board_instances);
    });
};

exports._getL2 = function(req, res) {
    Board_instance.findById(req.params.board_id, function(err, board_instance) {
	if (err)
	    res.send(err);
	res.json(board_instance);
    });
};

exports._putL2 = function(req, res) {
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
};

exports._deleteL2 = function(req, res) {
    Board_instance.remove({
	_id: req.params.board_id
    }, function(err, board) {
	if (err)
	    res.send(err);
	    
	res.json({ message: 'Successfully deleted' });
    });
};

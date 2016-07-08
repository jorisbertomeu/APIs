var Board     = require('../models/board');

exports._postL1 = function(req, res) {
    var board = new Board();
	
    board.name = req.body.name;
    board.manufacturer = req.body.manufacturer;
    board.model = req.body.model;
    board.image = req.body.mode;
	    
    board.save(function(err) {
	if (err)
	    res.send(err);

	res.json({ message: 'Board created!' });
    });	
};

exports._getL1 = function(req, res) {
    Board.find(function(err, boards) {
	if (err)
	    res.send(err);
	    
	res.json(boards);
    });
};

exports._getL2 = function(req, res) {
    Board.findById(req.params.board_id, function(err, board) {
	if (err)
	    res.send(err);
	res.json(board);
    });
};

exports._putL2 = function(req, res) {
    Board.findById(req.params.board_id, function(err, board) { 
	if (err)
	    res.send(err);
	    
	board.name = req.body.name;
	board.save(function(err) {
	    if (err)
		res.send(err);
		
	    res.json({ message: 'Board updated!' });
	});	    
    });
};

exports._deleteL2 = function(req, res) {
    Board.remove({
	_id: req.params.board_id
    }, function(err, board) {
	if (err)
	    res.send(err);
	    
	res.json({ message: 'Successfully deleted' });
    });
};



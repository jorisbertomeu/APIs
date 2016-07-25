var Project = require('../models/project');

var Promise = require('bluebird');

// Create poject
exports._postL1 = function(req, res) {
	var project = new Project();

	project.description 		= req.body.description;
    project.customer_id 		= req.body.customer_id;
    project.board_instance_id 	= req.body.board_instance_id;
    project.name 				= req.body.name;
    project.created_on 			= Date.now() / 1000 | 0;

    project.save(function(err){
    	if(err)
    		res.send(err);

    	res.json({message: 'Project created!'});
    });
};
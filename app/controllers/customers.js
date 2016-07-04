var Customer = require('../models/customer');
var Board_instance = require('../models/board_instance');
var Promise = require('bluebird');

exports._postL1 = function(req, res) {
    var customer = new Customer();
	
    customer.name = req.body.name;
    customer.company = req.body.company;
    customer.address = req.body.address;
    customer.telephone = req.body.telephone;
    customer.board_instances = req.body.board_instances;
    
    customer.save(function(err) {
	if (err)
	    res.send(err);

	res.json({ message: 'Customer created!' });
    });	
};

function linkCustomer(customer) {
    return new Promise(function (resolve, reject) {
	Board_instance.find({
	    customer_id: customer
	}, function (error, board_instances) {
	    if (error) {
		reject(error);
		return;
	    }
	    var r = customer.toObject();
	    r.board_instances = Array();
	    board_instances.forEach(function(item) {
		r.board_instances.push(item._id);
	    });
	    resolve(r);
	});
    });
}


exports._getL1 = function(req, res) {
    Customer.find({}, function(err, customers) {
	if (err)
	    res.send(err);
	Promise.all(customers.map(function(customer) {
	    return new Promise(function (resolve, reject) {
		Board_instance.find({
		    customer_id: customer
		}, function (error, board_instances) {
		    if (error) {
			reject(error);
			return;
		    }
		    var r = customer.toObject();
		    r.board_instances = Array();
		    board_instances.forEach(function(item) {
			r.board_instances.push(item._id);
		    });
		    resolve(r);
		});
	    });
	})).then(function(fullCustomers) {
	    var o = Array();

	    res.json(fullCustomers);
	});
    });
};

exports._getL2 = function(req, res) {
    Customer.findById(req.params.customer_id, function(err, customer) {
	if (err)
	    res.send(err);
	Board_instance.find({'customer_id': customer._id}, function(err, board_instances) {
	    if (err)
		res.send(err);
	    var r = customer.toObject();
	    r.board_instances = board_instances;
	    res.json(r);
	});
    });
};

exports._putL2 = function(req, res) {
    Customer.findById(req.params.customer_id, function(err, customer) { 
	if (err)
	    res.send(err);
	    
	customer.name = req.body.name;
	customer.save(function(err) {
	    if (err)
		res.send(err);
		
	    res.json({ message: 'Customer updated!' });
	});	    
    });
};

exports._deleteL2 = function(req, res) {
    Customer.remove({
	_id: req.params.customer_id
    }, function(err, customer) {
	if (err)
	    res.send(err);
	    
	res.json({ message: 'Successfully deleted' });
    });
};



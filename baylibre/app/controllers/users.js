var User = require('../models/user');
var Customer = require('../models/customer');
var Promise = require('bluebird');
var crypto = require('crypto');
var Utils = require('../utils');

exports._postL1 = function(req, res) {
    var user = new User();
    var shasum = crypto.createHash('sha1');
    
    
    user.username = req.body.username;
    shasum.update(req.body.password);
    user.password = shasum.digest('hex');
    user.created_on = Date.now() / 1000 | 0;
    user.isAdmin = req.body.isAdmin;
    user.customers_id = req.body.customers_id;
    
    user.save(function(err) {
	if (err)
	    res.send(err);

	res.json({ message: 'User created!' });
    });	
};

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
	var randomPoz = Math.floor(Math.random() * charSet.length);
	randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

exports._postL1_logout = function(req, res) {
    if (!req.body.hasOwnProperty('username')) {
	res.send({'error': 'You must provide a \'username\' property into JSON body request to logout an user'});
	return;
    }
    User.findOne({"username": req.body.username}, function(err, user) {
	if (err)
	    res.send(err);

	if (user.user_tokens.indexOf(req.headers.authorization) < 0)
	    res.send({'error': 'Token provided is not associated to the specified user'});
	
	user.user_tokens.splice(user.user_tokens.indexOf(req.headers.authorization), 1);
	user.save(function(err) {
	    if (err)
		res.send(err);
	    var obj = user.toObject();
	    delete obj['user_tokens'];
	    res.json(obj);
	});
    });
};

exports._postL1_login = function(req, res) {
    var shasum = crypto.createHash('sha1');
    
    User.findOne({"username": req.body.username}, function(err, user) {
	if (err)
	    res.send(err);
	shasum.update(req.body.password);
	if (!user || user.password != shasum.digest('hex')) {
	    res.json({"error": "Bad user and/or password"});
	    return;
	}
	var obj = user.toObject();
	obj.user_token = randomString(42);
	user.user_tokens.push(obj.user_token);
	user.save(function(err) {
	    if (err)
		res.send(err);
	    delete obj['user_tokens'];
	    res.json(obj);
	});
    });
};

exports._getL1 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	User.find({}, function(err, users) {
	    if (err)
		res.send(err);
	    res.json(users);
	});
    });
};


exports._getL2 = function(req, res) {
    Utils.checkToken(req, res, false, req.params.user_id).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	User.findById(req.params.user_id, function(err, user) {
	    if (err)
		res.send(err);
	    res.json(user);
	});
    });
};

exports._putL2 = function(req, res) {
    Utils.checkToken(req, res, false, req.params.user_id).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	User.findById(req.params.user_id, function(err, user) { 
	    if (err)
		res.send(err);
	    
	    user.name = req.body.name;
	    user.save(function(err) {
		if (err)
		    res.send(err);
		
		res.json({ message: 'User updated!' });
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
	User.remove({
	    _id: req.params.user_id
	}, function(err, user) {
	    if (err)
		res.send(err);
	    
	    res.json({ message: 'Successfully deleted' });
	});
    });
};

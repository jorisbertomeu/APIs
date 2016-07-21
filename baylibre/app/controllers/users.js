var User = require('../models/user');
var Forgot = require('../models/forgot');
var Customer = require('../models/customer');
var Promise = require('bluebird');
var crypto = require('crypto');
var Utils = require('../utils');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

exports._postL1 = function(req, res) {
    var user = new User();
    var shasum = crypto.createHash('sha1');
    
    
    user.username = req.body.username;
    shasum.update(req.body.password);
    user.password = shasum.digest('hex');
    user.created_on = Date.now() / 1000 | 0;
    user.isAdmin = req.body.isAdmin;
    user.customers_id = req.body.customers_id;
    user.email = req.body.email;
    
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

exports._postL1_forgot = function(req, res) {
    if (!req.body.hasOwnProperty('email') && !req.body.hasOwnProperty('username')) {
	res.send({'error': 'You must provide a [\'email\' or \'username\'] property into JSON body request in order to send reset password link'});
	return;
    }
    var toSearch = ((req.body.hasOwnProperty('email')) ? "email" : "username");
    User.findOne({[toSearch]: ((req.body.hasOwnProperty('email')) ? req.body.email : req.body.username)}, function(err, user) {
	if (err)
	    res.send(err);
	if (!user || user === null) {
	    res.send({'error': 'User not found by his ' + toSearch + ' : ' + ((req.body.hasOwnProperty('email')) ? req.body.email : req.body.username)});
	    return;
	}
	var transporter = nodemailer.createTransport(
	    smtpTransport({
		host: "powerci.org",
		secure: false,
		port: 587,
		auth: {
		    user: "mail@powerci.org",
		    pass: "powerci"
		},
		tls: {rejectUnauthorized: false},
		debug:true
	    })
	);

	var forgotHash = randomString(32);
	var forgot = new Forgot();
    
	forgot.username = req.body.username;
	forgot.date = Date.now() / 1000 | 0;
	forgot.hash = forgotHash;
	forgot.ip = req.connection.remoteAddress;
	forgot.user_id = user.id;
	
	forgot.save(function(err) {
	    if (err)
		res.send(err);
	    var mailOptions = {
		from: '"PowerCI"<no-reply@powerci.org>',
		to: user.email,
		subject: 'Password Reset Request',
		text: 'Hi, '+user.username+', You recently requested to reset your password for your PowerCI account ('+req.connection.remoteAddress+'). Copy the link to reset it : http://powerci.org/forgot?v='+forgot.id+'&h='+forgotHash+'. If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 30 minutes. © 2016 PowerCI. All rights reserved. PowerCI - http://powerci.org/',
		html: '<div style="width:70%;margin-left:15%"><div style="text-align:center;background-color:#F3F5F7;padding:1%"><h1>PowerCI</h1></div><div style="width:70%;margin-left:15%"><h2>Hi '+user.username+',</h2><br>You recently requested to reset your password for your PowerCI account ('+req.connection.remoteAddress+'). Click the link below to reset it.<br><br><center><a href="http://powerci.org/forgot?v='+forgot.id+'&h='+forgotHash+'">Reset your password</a></center><br><br>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 30 minutes.</div><br><br><div style="text-align:center;background-color:#F3F5F7;padding:4%">© 2016 PowerCI. All rights reserved.<br>PowerCI - <a href="http://powerci.org/">http://powerci.org/</a></div></div>'
	    };
	    res.json({"message": "Reset password link for "+user.username+" will be sent to "+user.email});
	    transporter.sendMail(mailOptions, function(error, info) {
		if (error){
		    return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	    });
	});	
    });
};

exports._postL2_forgot = function(req, res) {
    if (!req.body.hasOwnProperty('forgot_id') || !req.body.hasOwnProperty('hash'))
	res.send({'error': 'You must provide [\'forgot_id\' and \'hash\'] property into JSON body request'});
    Forgot.findById(req.body.forgot_id, function(err, forgot) {
	if (err)
	    return res.send({'error': err});
	if (!forgot || forgot === null)
	    return res.send({'error': 'Bad forgot_id'});
	if (forgot.hash != req.body.hash)
	    return res.send({'error': 'Bad hash provided'});
	console.log('Result = ' + eval(Date.now() / 1000 - forgot.date) + ' != ' + eval(60 * 30));
	if (eval(Date.now() / 1000 - forgot.date) >= (60 * 30))
	    return res.send({'error': 'Link expired'});
	User.findById(forgot.user_id, function(err, user) {
	    if (err)
		res.send(err);
	    res.json(user);
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

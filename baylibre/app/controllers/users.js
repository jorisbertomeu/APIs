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

    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	var missing = Utils.checkFields(req.body, ["username", "password", "isAdmin", "customers_id", "email", "sendWelcomeMail"]);
	if (missing.length != 0)
	    return res.send({message: Utils.Constants._MSG_ARGS_, details: "Missing followwing properties : " + missing, code: Utils.Constants._CODE_ARGS_});
	user.username = req.body.username;
	shasum.update(req.body.password);
	user.password = shasum.digest('hex');
	user.created_on = Date.now() / 1000 | 0;
	user.isAdmin = req.body.isAdmin;
	user.customers_id = req.body.customers_id;
	user.email = req.body.email;

	if (req.body.sendWelcomeMail) {
	    try {
		var mail_text = Utils.loadFile(global.config.mail.welcomeMail.templates.text);
		var mail_html = Utils.loadFile(global.config.mail.welcomeMail.templates.html);
	    } catch (err) {
		console.log(err);
		return res.send({message: 'Error while fetching mail template, action canceled', details: err, code: Utils.Constants._CODE_FAILED_});
	    }
	}
    
	user.save(function(err) {
	    if (err)
		return Utils.sendError(res, err);
	    if (req.body.sendWelcomeMail) {
		var mailOptions = {
		    from: '"'+global.config.mail.welcomeMail.settings.fromName+'"<'+global.config.mail.welcomeMail.settings.fromAddress+'>',
		    to: user.email,
		    subject: global.config.mail.welcomeMail.settings.subject,
		    text: Utils.parseWelcomeMail(mail_text, user, req),
		    html: Utils.parseWelcomeMail(mail_html, user, req)
		};
	    }
	    res.json({message: Utils.Constants._MSG_CREATED_, details: user, code: Utils.Constants._CODE_CREATED_});
	    Utils.getMailTransporter().sendMail(mailOptions, function(error, info) {
		if (error)
		    return console.log(error);
		console.log('Message sent: ' + info.response);
	    });
	});	
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
    var missing = Utils.checkFields(req.body, ["username"]);
    if (missing.length != 0)
	return res.send({message: Utils.Constants._MSG_ARGS_, details: "Missing followwing properties : " + missing, code: Utils.Constants._CODE_ARGS_});
    User.findOne({"username": req.body.username}, function(err, user) {
	if (err)
	    return Utils.sendError(res, err);
	if (user.user_tokens.indexOf(req.headers.authorization) < 0)
	    res.send({message: Utils.Constants._MSG_TOKEN_, details: 'Token provided is not associated to the specified user', code: Utils.Constants._CODE_TOKEN_});
	user.user_tokens.splice(user.user_tokens.indexOf(req.headers.authorization), 1);
	user.save(function(err) {
	    if (err)
		return Utils.sendError(res, err);
	    var obj = user.toObject();
	    delete obj['user_tokens'];
	    res.json({message: Utils.Constants._MSG_OK_, details: obj, code: Utils.Constants._CODE_OK_});
	});
    });
};

exports._postL1_forgot = function(req, res) {
    if (!req.body.hasOwnProperty('email') && !req.body.hasOwnProperty('username'))
	return res.send({message: Utils.Constants._MSG_FAILED_, details: 'You must provide a [\'email\' or \'username\'] property into JSON body request in order to send reset password link', code: Utils.Constants._CODE_FAILED_});
    var toSearch = ((req.body.hasOwnProperty('email')) ? "email" : "username");
    User.findOne({[toSearch]: ((req.body.hasOwnProperty('email')) ? req.body.email : req.body.username)}, function(err, user) {
	if (err)
	    return res.send({message: Utils.Constants.MSG_UNKNOWN_, details: err, code: Utils.Constants._CODE_UNKNOWN_});
	if (!user || user === null)
	    return res.send({message: Utils.Constants._MSG_FAILED_, details: 'User not found by his ' + toSearch + ' : ' + ((req.body.hasOwnProperty('email')) ? req.body.email : req.body.username), code: Utils.Constants._CODE_FAILED_});

	var forgotHash = randomString(32);
	var forgot = new Forgot();
    
	forgot.username = req.body.username;
	forgot.date = Date.now() / 1000 | 0;
	forgot.hash = forgotHash;
	forgot.ip = req.connection.remoteAddress;
	forgot.user_id = user.id;
	forgot.used = false;
	
	try {
	    var mail_text = Utils.loadFile(global.config.mail.forgotMail.templates.text);
	    var mail_html = Utils.loadFile(global.config.mail.forgotMail.templates.html);
	} catch (err) {
	    return res.send({message: Utils.Constants._MSG_UNKNOWN_, details: 'Error while fetching mail template, action canceled', code: Utils.Constants._CODE_UNKNOWN_});
	}
	forgot.save(function(err) {
	    if (err)
		return res.send({message: Utils.Constants._MSG_FAILED_, details: err, code: Utils.Constants._CODE_FAILED_});
	    var mailOptions = {
		from: '"'+global.config.mail.forgotMail.settings.fromName+'"<'+global.config.mail.forgotMail.settings.fromAddress+'>',
		to: user.email,
		subject: global.config.mail.forgotMail.settings.subject,
		text: Utils.parseForgotMail(mail_text, user, forgot, req, forgotHash),
		html: Utils.parseForgotMail(mail_html, user, forgot, req, forgotHash)
	    };
	    res.json({message: Utils.Constants._MSG_OK_, details: "Reset password link for " + user.username + " will be sent to " + user.email, code: Utils.Constants._CODE_OK_});
	    Utils.getMailTransporter.sendMail(mailOptions, function(error, info) {
		if (error)
		    return console.log(error);
		console.log('Message sent: ' + info.response);
	    });
	});	
    });
};

exports._getL3_forgot = function(req, res) {
    Forgot.findById(req.params.forgot_id, function(err, forgot) {
	if (err)
	    return Utils.sendError(res, err);
	if (!forgot || forgot === null)
	    return res.send({message: Utils.Constants._MSG_FAILED_, details: "Bad forgot ID", code: Utils.Constants._CODE_FAILED_});
	if (forgot.hash != req.params.hash)
	    return res.send({message: Utils.Constants._MSG_FAILED_, details: "Bad Hash provided", code: Utils.Constants._CODE_FAILED_});
	if (forgot.used)
	    return res.send({message: Utils.Constants._MSG_FAILED_, details: 'This reset link has already been used', code: Utils.Constants._CODE_FAILED_});
	if (eval(Date.now() / 1000 - forgot.date) >= (60 * 30))
	    return res.send({message: Utils.Constants._MSG_FAILED_, details: 'Link expired', code: Utils.Constants._CODE_FAILED_});
	User.findById(forgot.user_id, function(err, user) {
	    if (err)
		return Utils.sendError(res, err);
	    forgot.used = true;
	    forgot.save(function(err, forgot) {
		if (err)
		    return Utils.sendError(res, err);
		res.json({message: Utils.Constants._MSG_OK_, details: user, code: Utils.Constants._CODE_OK_});
	    });
	});
    });
};

exports._postL1_login = function(req, res) {
    var shasum = crypto.createHash('sha1');
    
    var missing = Utils.checkFields(req.body, ["username", "password"]);
    if (missing.length != 0)
	return res.send({message: Utils.Constants._MSG_ARGS_, details: "Missing followwing properties : " + missing, code: Utils.Constants._CODE_ARGS_});
    User.findOne({"username": req.body.username}, function(err, user) {
	if (err)
	    return res.send({message: Utils.Constants._MSG_UNKNOWN_, details: err, code: _CODE_UNKNOWN_});
	shasum.update(req.body.password);
	if (!user || user.password != shasum.digest('hex'))
	    return res.json({message: Utils.Constants._MSG_FAILED_, details: "Bad user and/or password", code: Utils.Constants._CODE_FAILED_});
	var obj = user.toObject();
	obj.user_token = randomString(42);
	user.user_tokens.push(obj.user_token);
	user.save(function(err) {
	    if (err)
		return res.send({message: Utils.Constants._MSG_UNKNOWN_, details: err, code: Utils.Constants._CODE_UNKNOWN_});
	    delete obj['user_tokens'];
	    res.json({message: Utils.Constants._MSG_OK_, details: obj, code: Utils.Constants._CODE_OK_});
	});
    });
};

exports._getL1 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result)
	    return Utils.sendUnauthorized(req, res);
	User.find({}, function(err, users) {
	    if (err)
		return Utils.sendError(res, err);
	    res.json({message: Utils.Constants._MSG_OK_, details: users, code: Utils.Constants._CODE_OK_});
	});
    });
};


exports._getL2 = function(req, res) {
    Utils.checkToken(req, res, false, req.params.user_id).then(function(result) {
	if (!result)
	    return Utils.sendUnauthorized(req, res);
	User.findById(req.params.user_id, function(err, user) {
	    if (err)
		return Utils.sendError(res, err);
	    res.json(user);
	});
    });
};

exports._putL2 = function(req, res) {
    var shasum = crypto.createHash('sha1');
    Utils.checkToken(req, res, true, req.params.user_id).then(function(result) {
	if (!result)
	    return Utils.sendUnauthorized(req, res);
	User.findById(req.params.user_id, function(err, user) { 
	    if (err)
		return Utils.sendError(res, err);

	    if (req.body.hasOwnProperty('name'))
		user.name = req.body.name;
	    if (req.body.hasOwnProperty('email'))
		user.email = req.body.email;
	    if (req.body.hasOwnProperty('password')) {
		shasum.update(req.body.password);
		user.password = shasum.digest('hex');
	    }
	    
	    if (req.body.hasOwnProperty('customers_id') || req.body.hasOwnProperty('isAdmin')) {
		Utils.checkToken(req, res, true).then(function(result) {
		    if (req.body.hasOwnProperty('customers_id'))
			user.customers_id = req.body.customers_id;
		    if (req.body.hasOwnProperty('isAdmin'))
			user.isAdmin = req.body.isAdmin;
		    user.save(function(err) {
			if (err)
			    return Utils.SendError(res, err);
			res.json({message: Utils.Constants._MSG_MODIFIED_, details: user, code: Utils.Constants._CODE_MODIFIED_});
		    });
		});
	    } else {
		user.save(function(err) {
		    if (err)
			return Utils.SendError(res, err);
		    res.json({message: Utils.Constants._MSG_MODIFIED_, details: user, code: Utils.Constants._CODE_MODIFIED_});
		});
	    }
	});
    });
};

exports._deleteL2 = function(req, res) {
    Utils.checkToken(req, res, true).then(function(result) {
	if (!result)
	    return Utils.sendUnauthorized(req, res);
	User.remove({_id: req.params.user_id}, function(err, user) {
	    if (err)
		return Utils.sendError(res, err);
	    res.json({message: Utils.Constants._MSG_DELETED_, details: user, code: Utils.Constants._CODE_DELETED_});
	});
    });
};

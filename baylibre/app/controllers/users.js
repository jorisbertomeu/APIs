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
    var missing;

    Utils.checkToken(req, res, true).then(function(result) {
	if (!result) {
	    Utils.sendUnauthorized(req, res);
	    return;
	}
	missing = Utils.checkFields(req.body, ["username", "password", "isAdmin", "customers_id", "email", "sendWelcomeMail"]);
	if (missing.length != 0)
	    return res.send({'error': "Missing followwing properties : " + missing});
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
		return res.send({'error': 'Error while fetching mail template, action canceled', 'details': err});
	    }
	}
    
	user.save(function(err) {
	    if (err)
		res.send(err);
	    if (req.body.sendWelcomeMail) {
		var mailOptions = {
		    from: '"'+global.config.mail.welcomeMail.settings.fromName+'"<'+global.config.mail.welcomeMail.settings.fromAddress+'>',
		    to: user.email,
		    subject: global.config.mail.welcomeMail.settings.subject,
		    text: Utils.parseWelcomeMail(mail_text, user, req),
		    html: Utils.parseWelcomeMail(mail_html, user, req)
		};
	    }
	    res.json({message: user});
	    Utils.getMailTransporter().sendMail(mailOptions, function(error, info) {
		if (error){
		    return console.log(error);
		}
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
	    console.log(err);
	    return res.send({'error': 'Error while fetching mail template, action canceled', 'details': err});
	}
	forgot.save(function(err) {
	    if (err)
		res.send(err);
	    var mailOptions = {
		from: '"'+global.config.mail.forgotMail.settings.fromName+'"<'+global.config.mail.forgotMail.settings.fromAddress+'>',
		to: user.email,
		subject: global.config.mail.forgotMail.settings.subject,
		text: Utils.parseForgotMail(mail_text, user, forgot, req, forgotHash),
		html: Utils.parseForgotMail(mail_html, user, forgot, req, forgotHash)
	    };
	    res.json({"message": "Reset password link for "+user.username+" will be sent to "+user.email});
	    Utils.getMailTransporter.sendMail(mailOptions, function(error, info) {
		if (error){
		    return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	    });
	});	
    });
};

exports._getL3_forgot = function(req, res) {
    Forgot.findById(req.params.forgot_id, function(err, forgot) {
	if (err)
	    return res.send({'error': err});
	if (!forgot || forgot === null)
	    return res.send({'error': 'Bad forgot_id'});
	if (forgot.hash != req.params.hash)
	    return res.send({'error': 'Bad hash provided'});
	if (forgot.used)
	    return res.send({'error': 'This reset link has already been used'});
	console.log('Result = ' + eval(Date.now() / 1000 - forgot.date) + ' != ' + eval(60 * 30));
	if (eval(Date.now() / 1000 - forgot.date) >= (60 * 30))
	    return res.send({'error': 'Link expired'});
	User.findById(forgot.user_id, function(err, user) {
	    if (err)
		res.send(err);
	    forgot.used = true;
	    forgot.save(function(err, forgot) {
		if (err)
		    return res.send({'error': err});
		res.json(user);
	    });
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

		// Result
		var result = user.toObject();

	// Get User with fetching objects
	if (req.query.full == "true") {
		Promise.all([function(user) {
			return new Promise(function(resolve, reject){
				Customer.findById(user.customers_id, function(err, customers){
					if(err) 
						reject(err);
					resolve(result);
				});
			});
		}]).then(function(customers){
			result.customers_id = customers.toObject();
			//Send result
			res.json(result);
		});

	} else 
			// Get user without fetching objects
			// Send result
		    res.json(result);
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

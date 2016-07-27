var User = require('./models/user');
var Promise = require('bluebird');
var fs = require('fs');
var Customer = require('./models/customer');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

exports.checkToken = function(req, res, mustBeAdmin, userId) {
    return new Promise(function(resolve, reject) {
	User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
	    if (err)
		return reject(err);
	    if (!user || user === null)
		return resolve(false);
        if(userId instanceof Array) {
            if(userId !== undefined && (userId.indexOf(User) != -1)) 
                return resolve(true);
        } else {
    	    if (userId !== undefined && userId.toString() != user._id.toString())
    		return resolve(false);
        }
	    if (mustBeAdmin && user.isAdmin)
		return resolve(true);
	    else if (mustBeAdmin && !user.isAdmin)
		return resolve(false);
	    return resolve(true);
	});
    });
};

exports.getUsersByCustomer = function(customer_id) {
    return new Promise(function(resolve, reject) {
        User.find({customers_id: {"$in": [customer_id]}}, function(err, users) {
            if (err)
                reject(err);
            resolve(users);
        });
    });
};

exports.sendUnauthorized = function(req, res) {
    res.status(403);
    res.send({'error': 'Your user is not allowed to access to this resource'});
};

exports.replaceAll = function(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

exports.parseForgotMail = function(mail, user, forgot, req, hash) {
    var me = require('./utils');

    mail = me.replaceAll(mail, "%username%", user.username);
    mail = me.replaceAll(mail, "%ip%", req.connection.remoteAddress);
    mail = me.replaceAll(mail, "%forgotid%", forgot.id);
    mail = me.replaceAll(mail, "%hash%", hash);
    return mail;
}

exports.parseWelcomeMail = function(mail, user, req) {
    var me = require('./utils');

    mail = me.replaceAll(mail, "%username%", user.username);
    mail = me.replaceAll(mail, "%ip%", req.connection.remoteAddress);
    return mail;
}

exports.loadFile = function(filename) {
    var data = null;

    try {
    	data = fs.readFileSync(filename, 'utf8');
    	return data;
    } catch (err) {
    	console.log('There has been an error when fetching file \''+filename+'\'')
    	console.log(err);
    	console.log('this is the end');
    	throw err;
    }
}

exports.checkFields = function(o, fields) {
    var missing = [];

    fields.forEach(function(item) {
	if (!o.hasOwnProperty(item))
	    missing.push(item);
    });
    return missing;
}

exports.publicAccess = function(tab, res) {
    var baseEndpoint = res.split('/');
    console.log('Searching for endpoint \'/' + baseEndpoint[1] + '\'');
    if (tab.indexOf('/' + baseEndpoint[1]) >= 0) {
	return true;
    }    
    return false;
}

exports.getMailTransporter = function() {
    return transporter = nodemailer.createTransport(
	smtpTransport({
	    host: global.config.mail.smtp.server,
	    secure: false,
	    port: global.config.mail.smtp.port,
	    auth: {
		user: global.config.mail.smtp.user,
		pass: global.config.mail.smtp.password
	    },
	    tls: {rejectUnauthorized: false},
	    debug:true
	})
    );
};

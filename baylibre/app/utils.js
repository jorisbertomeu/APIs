var User = require('./models/user');
var Promise = require('bluebird');
var fs = require('fs');

exports.checkToken = function(req, res, mustBeAdmin, userId) {
    return new Promise(function(resolve, reject) {
	User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
	    if (err)
		return reject(err);
	    if (!user || user === null)
		return resolve(false);
	    if (userId !== undefined && userId != user._id)
		return resolve(false);
	    if (mustBeAdmin && user.isAdmin)
		return resolve(true);
	    else if (mustBeAdmin && !user.isAdmin)
		return resolve(false);
	    return resolve(true);
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

exports.parseMail = function(mail, user, forgot, req, hash) {
    var me = require('./utils');

    mail = me.replaceAll(mail, "%username%", user.username);
    mail = me.replaceAll(mail, "%ip%", req.connection.remoteAddress);
    mail = me.replaceAll(mail, "%forgotid%", forgot.id);
    mail = me.replaceAll(mail, "%hash%", hash);
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

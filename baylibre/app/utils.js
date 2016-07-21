var User = require('./models/user');
var Promise = require('bluebird');

exports.checkToken = function(req, res, mustBeAdmin, userId) {
    return new Promise(function(resolve, reject) {
	User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
	    if (err)
		reject(err);
	    if (!user || user === null)
		reject({'error': 'No user found for this token'});
	    if (userId !== undefined && userId != user._id)
		resolve(false);
	    if (mustBeAdmin && user.isAdmin)
		resolve(true);
	    else if (mustBeAdmin && !user.isAdmin)
		resolve(false);
	    resolve(true);
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

/*
  Keywords mapping :
  %username% = username - user.username
  %ip% = Origin IP address - req.connection.remoteAddress
  %forgotid% = Mongo ID of forgot instance - forgot.id
  %hash% = Forgot hash - hash
*/

exports.parseMail = function(mail, user, forgot, req, hash) {
    var me = require('./utils');
    mail = me.replaceAll(mail, "%username%", user.username);
    mail = me.replaceAll(mail, "%ip%", req.connection.remoteAddress);
    mail = me.replaceAll(mail, "%forgotid%", forgot.id);
    mail = me.replaceAll(mail, "%hash%", hash);
    return mail;
}

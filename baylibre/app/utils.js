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

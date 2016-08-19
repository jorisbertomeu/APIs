var User                        =   require('./models/user');
var Group                       =   require('./models/group');
var Role                        =   require('./models/role');
var UserRoleBoardInstance       =   require('./models/user_role_board_instance');
var UserRoleGroup               =   require('./models/user_group_roles');
var Customer                    =   require('./models/customer');
var Action                      =   require('./models/action');

var Promise                     =   require('bluebird');
var fs                          =   require('fs');
var nodemailer                  =   require('nodemailer');
var smtpTransport               =   require('nodemailer-smtp-transport');
var Constants                   =   require('./constants');

exports.Constants = Constants;


// Is authorized
exports.isAuthorized = function(req, action_techincal_title) {
    return new Promise(function(resolve, reject) {
        User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
            if (err)
                return reject(err);
            if (!user || user === null)
                return resolve(false);
            if(user.isAdmin) 
                return resolve(true);
            if(null != req.body.group_id && isNotEmpty(req.body.group_id)) {
                // Check if the action is in the user's role
                UserRoleGroup.findOne({user_id: user._id, gruoup_id: group_Id}, function(err, userRoleGroup){
                    if(err) 
                        return reject(err);
                    if(userRoleGroup != null) {
                        Role.findById(userRoleGroup.role_id).populate("actions_list").exec(function(err, role){
                            if(role) {
                                role.actions_list.forEach(function(action) {
                                    var access = false;
                                    if(action.technical_title == action_techincal_title) 
                                        access = true;
                                    if(access)
                                        return resolve(true);
                                    else 
                                        return resolve(false);
                                });
                            } else 
                                return resolve(false);
                        });

                    } else 
                        return resolve(false);
                });
            } else 
                return resolve(false);
        });
    });

};

exports.checkToken = function(req, res, mustBeAdmin, userId) {
    return new Promise(function(resolve, reject) {
        /*
        //console.log("users id :" + userId);
    	User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
    	    if (err)
    		return reject(err);
    	    if (!user || user === null)
    		return resolve(false);
            if(user.isAdmin) 
                return resolve(true);
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
        */
        return resolve(true);
    });
};

// Get users by customer id
exports.getUsersByCustomer = function(customer_id) {
    return new Promise(function(resolve, reject) {
        User.find({customers_id: {"$in": [customer_id]}}, function(err, users) {
            if (err)
                reject(err);
            resolve(users);
        });
    });
};

// Get user by user email
exports.getUserByEmail = function(email) {
    return new Promise(function(resolve, reject) {
            User.find({"email": email}, function(err, user) {
                if(err) reject(err);
                resolve(user);
        });
    });
};

// Get user by user username
exports.getUserByUserName = function(username) {
    return new Promise(function(resolve, reject) {
            User.find({"username": username}, function(err, user) {
                if(err) reject(err);
                resolve(user);
        });
    });
};  

exports.sendUnauthorized = function(req, res) {
    res.status(403);
    res.send({message: Constants._MSG_UNAUTHORIZED_, details: "Token mismatch with authorized token", code: Constants._CODE_ERROR_});
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
	if (!o.hasOwnProperty(item) && !isNotEmpty(o.item))
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

function isNotEmpty(string) {
    return string != null && string !== undefined && string != "";
}
exports.isNotEmpty = isNotEmpty;

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


exports.sendError = function(res, err) {
    return res.send({message: Constants._MSG_UNKNOWN_, details: err, code: Constants._CODE_UNKNOWN_});
};


// Error when missing params
exports.sendMissingParams = function(res, mapas) {
    res.status(403);
    res.send({message: Constants._MSG_MISSING_PARAMS_, details: "Missing fallowing params : " + mapas, code: Constants._CODE_ARGS_});
};

// Get group by name
exports.getGroupByName = function(groupName) {
    return new Promise(function(resolve, reject) {
        Group.find({"name" : groupName}, function (err, group) {
            if(err)
                reject(err);
            resolve(group);
        })
    });
}

// Get role by title
function getRoleByTitle (getRoleByTitle) {
    return new Promise(function(resolve, reject) {
        Role.find({"title" : getRoleByTitle}, function (err, role) {
            if(err)
                reject(err);
            resolve(role);
        })
    });
}

exports.getRoleByTitle = getRoleByTitle;



// Chek if user is admin in group
exports.isAdmin = function(grouId, userId) {
    return new Promise(function(resolve, reject) {
        Promise.any(getRoleByTitle("Admin")).then(function(role) {
            Group.find({_id : grouId, users: [userId, role._id]}, function (err, group) {
                if(err)
                    reject(err);
                if(null != group && group.length > 0) 
                    resolve(true);
                else 
                    resolve(false);
            })
        });
    });
}

// Chek if user is admin in group
exports.getUserRoleInGroup = function(grouId, userId) {
    return new Promise(function(resolve, reject) {
        Group.findOne({_id : grouId, users: [userId]}, function (err, group) {
            if(err)
                reject(err);
            if(null != group && group.length > 0) {
                Role.findById(group.users.role._id, function (err, role) {
                    if(err)
                        reject(err);
                    resolve(role);
                });
            } else 
                resolve(null);
        });
    });
}


// Get user role in group - board instance
exports.getGroupUserRoleBoardInstance = function(groupId, userId, boardInstanceId) {
    return new Promise(function(resolve, reject) {
        UserRoleBoardInstance.find({_id: {"$in" : groupId}, user_id: userId, board_instance_id: boardInstanceId}, function (err, userRoleBoardInstance) {
            if(err)
                reject(err);
            if(null != userRoleBoardInstance && userRoleBoardInstance.length > 0) {
                Role.findById(userRoleBoardInstance[0].role_id, function (err, role) {
                    if(err)
                        reject(err);
                    resolve(role);
                });
            } else {

                resolve(null);
            }
        });
    });
}

// Remove user role in group - board instance
exports.removeUserRoleBoardInstance = function(groupId, userId, boardInstanceId) {
    return new Promise(function(resolve, reject) {
        UserRoleBoardInstance.remove({_id: {"$in" : groupId}, user_id: userId, board_instance_id: boardInstanceId}, function (err, userRoleBoardInstance) {
            if(err)
                reject(err);
            resolve(true);
        });
    });
}

// Get user by token
exports.getUserByToken = function(req) {
    return new Promise(function(resolve, reject) {
        User.find({'user_tokens': req.headers.authorization}, function(err, user) {
            if (err)
                reject(err);
            resolve(user);
        });
    });
};

function echo (string) {
    console.log(string);
}
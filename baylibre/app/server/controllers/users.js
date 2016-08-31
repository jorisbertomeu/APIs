// Import entities
var User 			= require('../models/user');
var Forgot 			= require('../models/forgot');
var Customer 		= require('../models/customer');
var Group 			= require('../models/group');
var UserGroupRoles 	= require('../models/user_group_roles');
var UseRoleBoardInstance = require('../models/user_role_board_instances');

// Import Modules
var Promise = require('bluebird');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

//Mongoose
var mongoose = require('mongoose');
var Schema		= mongoose.Schema, ObjectId = Schema.ObjectId;

// Utils
var Utils = require('../utils');

// Create new user
// Technical name "users_create_user"
exports._create_user = function(req, res) {

	// Check fields
	var missing = Utils.checkFields(req.body, ["first_name", "last_name", "username", "password", "email"]);
	if (missing.length != 0)
		return Utils.sendMissingParams(res, missing);

	// Check if email is already used
	Promise.any([Utils.getUserByEmail(req.body.email)]).then(function(userByMail) {
		if(userByMail != null && userByMail.length > 0) {
		 	return res.json({message: Utils.Constants._MSG_MAIL_EXIST_, details: "This email is already used", code: Utils.Constants._CODE_KO_});
		} else {

			// Check if username is already used
			Utils.getUserByUserName(req.body.username).then(function(userByUsername) {
				if(userByUsername != null && userByUsername.length > 0) 
					 return res.send({message: Utils.Constants._MSG_USERNAME_EXIST_, details: "This username is already used", code: Utils.Constants._CODE_KO_});
				else  {

					var user = new User();
					var shasum = crypto.createHash('sha1');
					echo('avatar :');
					echo(req.body.avatar);
					// Mappeig params
					user.first_name		= req.body.first_name;
					user.last_name		= req.body.last_name;
					user.username 		= req.body.username;
					shasum.update(req.body.password);
					user.password 		= shasum.digest('hex');
					user.email 			= req.body.email;
					user.phone 			= req.body.phone;
					user.created_on 	= Date.now() / 1000 | 0;
					user.isAdmin 		= req.body.isAdmin;
					user.customers_id 	= req.body.customers_id;
					user.avatar 		= req.body.avatar;

					// Get welcome mail template
					try {
						var mail_text = Utils.loadFile(global.config.mail.welcomeMail.templates.text);
						var mail_html = Utils.loadFile(global.config.mail.welcomeMail.templates.html);
					} catch (err) {
						console.log(err);
						return res.send({message: 'Error while fetching mail template, action canceled', details: err, code: Utils.Constants._CODE_KO_});
					}
					// Save user
					user.save(function(err) {
						if (err)
							return Utils.sendError(res, err);

						// Send welcome mail
						if (req.body.sendWelcomeMail) {
							var mailOptions = {
								from: '"' + global.config.mail.welcomeMail.settings.fromName+'"<'+global.config.mail.welcomeMail.settings.fromAddress+'>',
								to: user.email,
								subject: global.config.mail.welcomeMail.settings.subject,
								text: Utils.parseWelcomeMail(mail_text, user, req),
								html: Utils.parseWelcomeMail(mail_html, user, req)
							};
						}
						
						res.json({message: Utils.Constants._MSG_CREATED_, details: user, code: Utils.Constants._CODE_OK_});
						Utils.getMailTransporter().sendMail(mailOptions, function(error, info) {
							if (error)
								return console.log(error);
							console.log('Message sent: ' + info.response);
						});
					});	
				}

			});

		}

	});
};



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

// Get all users
// Technical name "users_get_users"
exports._get_users = function(req, res) {
	// Technical title : 
	var tachnical_title = "users_get_users";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {
			User.find({}, function(err, users) {
				if (err)
					return Utils.sendError(res, err);
				res.json({message: Utils.Constants._MSG_OK_, details: users, code: Utils.Constants._CODE_OK_});
			});
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};


exports._get_user_by_id = function(req, res) {
	// Technical title : 
	var tachnical_title = "users_get_user_by_id";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			User.findById(req.params.user_id, function(err, user) {
				if (err)
					return Utils.sendError(res, err);

				//Send result
				res.json({message: Utils.Constants._MSG_OK_, details: user, code: Utils.Constants._CODE_OK_});
			});
		
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

exports._find_user = function(req, res) {
	// Technical title : 
	var tachnical_title = "users_find_user";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {
		if(isAuthorized) {

			if(req.query.id_group != null && req.query.id_group != "") {
				var list_id_users = [];

					var findGroupUsersId = new Promise(function(resolve, reject) {
							Group.findOne({_id: req.query.id_group}, 'users_role', function(err, groups){
								if(err)
									reject(err);
								groups.users_role.forEach(function(userRole) {
									if(userRole.user != null && userRole.user != "") {
										list_id_users.push(userRole.user);
										echo(list_id_users);
									}
								});
								resolve(list_id_users);
							});
						});

					if(req.query.not == Utils.Constants._TRUE_) {
						Promise.all([findGroupUsersId]).then(function(list_id_users) {
							list_id_users.forEach(function(elem) {
								echo("ici :" + elem);
							});

							if(null != list_id_users && list_id_users != "") {

								User.find({ $and: [ {
												_id : { $not: { $in : list_id_users.toString().split(',').map(function(o){ echo(o.toString()); return mongoose.Types.ObjectId(o.toString()); }) }}

											}, 
										{
									$or :[
										{username: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
										{first_name: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
										{last_name: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
										{email: new RegExp('.*' + req.params.requestString + '.*',"i")}
									]}
									]
								}, function(err, user) {
									if (err)
										return Utils.sendError(res, err);

									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: user, code: Utils.Constants._CODE_OK_});
								});
							} else {
								User.find( 
										{
									$or :[
										{username: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
										{first_name: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
										{last_name: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
										{email: new RegExp('.*' + req.params.requestString + '.*',"i")}
									]
									
								}, function(err, user) {
									if (err)
										return Utils.sendError(res, err);

									//Send result
									res.json({message: Utils.Constants._MSG_OK_, details: user, code: Utils.Constants._CODE_OK_});
								});
							}
						});

					} else {
						return Utils.sendError(res, "toooot");
					}
			} else {

				User.find({$or :[
								{username: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
								{first_name: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
								{last_name: new RegExp('.*' + req.params.requestString + '.*',"i")}, 
								{email: new RegExp('.*' + req.params.requestString + '.*',"i")}
							]
						}, function(err, user) {
				if (err)
					return Utils.sendError(res, err);

				//Send result
				res.json({message: Utils.Constants._MSG_OK_, details: user, code: Utils.Constants._CODE_OK_});
			});
		}
		
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
	});
};

exports._update_user = function(req, res) {
	
	// Technical title : 
	var tachnical_title = "users_update_user";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {
			
			var shasum = crypto.createHash('sha1');

			User.findById(req.params.user_id, function(err, user) { 
				if (err)
					return Utils.sendError(res, err);

				if (req.body.hasOwnProperty('email'))
					user.email = req.body.email;
				if (req.body.hasOwnProperty('password')) {
					shasum.update(req.body.password);
					user.password = shasum.digest('hex');
				}
				if (req.body.hasOwnProperty('first_name'))
					user.first_name		= req.body.first_name;
				if (req.body.hasOwnProperty('last_name'))
					user.last_name		= req.body.last_name;
				if (req.body.hasOwnProperty('username'))
					user.username 		= req.body.username;
				if (req.body.hasOwnProperty('phone'))
					user.phone 			= req.body.phone;
				if (req.body.hasOwnProperty('isAdmin'))
					user.isAdmin 		= req.body.isAdmin;
				if (req.body.hasOwnProperty('avatar'))
					user.avatar 		= req.body.avatar;
				
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
		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
});
};

exports._delete_user = function(req, res) {
	// Technical title : 
	var tachnical_title = "users_update_user";

	// Check if user have permission
	Utils.isAuthorized(req, tachnical_title).then(function(isAuthorized) {

		if(isAuthorized) {

			var deleteUserFromBoardInstances = new Promise(function(resolve, reject) {
		        // Delete user from all board instances 
				UseRoleBoardInstance.find({user_id: req.params.user_id}, function(err, listUserRoleBI) {
					if(err) 
						reject(err);
					if(listUserRoleBI.length > 0) {

						console.log(listUserRoleBI);

						var listUserRoleBIIds = [];

						// Remove user board instance role from groups
						listUserRoleBI.forEach(function(userBIRole) {
							listUserRoleBIIds.push(userBIRole._id);
							// Get all groups with a user board instance role
							Group.find({user_board_role: userBIRole._id}, function(err, grps) {
								if(err) 
									reject(err);
								// Remove role user from groups
								grps.forEach(function(grp) {
									grps.user_board_role.splice({user_board_role: userBIRole._id}, 1);
									grps.save(function(err) {
										if(err) 
											reject(err);
										resolve(true);
									});
								});
							});
						});

						UseRoleBoardInstance.remove({_id: {"$in": listUserRoleBIIds}}, function(err) {
							if(err)
								reject(err);
							resolve(true);
						});
					} else
						resolve(true);
				});
		    });

		    var deleteUserFromGroupUsers = new Promise(function(resolve, reject) {
		    	// Delete usre from all groups
				Group.find({'users.user': req.params.user_id}, function(err, groups) {
					console.log(groups);
					if(groups.length > 0) {
						groups.forEach(function(grp) {
							// Delete user from all roles 
							UserGroupRoles.remove({gruoup_id: grp._id, user_id: req.params.user_id}, function(err) {
								if(err) 
									reject(err);

								// Remove old roles if exist
					            grp.users.splice({'user': req.params.user_id}, 1);
					            grp.save(function(err) {
										if(err) 
											reject(err);
										resolve(true);
									});
							});
						});
					} else 
						resolve(true);
				});
		    });


			Promise.all([deleteUserFromBoardInstances, deleteUserFromGroupUsers]).then(function(rslt) {
				User.remove({_id: req.params.user_id}, function(err, user) {
					if (err)
						return Utils.sendError(res, err);
					res.json({message: Utils.Constants._MSG_DELETED_, details: user, code: Utils.Constants._CODE_DELETED_});
				});
			});

		} else {
			Utils.sendUnauthorized(req, res);
			return;
		}
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


function echo (string) {
	console.log(string);
}
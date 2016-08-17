var Action	=	require('./models/action');
var Utils	=	require('./utils');

function define(name, value) {
    Object.defineProperty(exports, name, {
	value:      value,
	enumerable: true
    });
}

/* Definition of code returned by API */
define("_CODE_OK_", 0);
define("_CODE_KO_", -1);

/* Admin role title*/
define("_ADMIN_ROLE_TITLE_", "Admin");


/* Definition of message returned by API */
define("_MSG_KO_","action failed");
define("_MSG_OK_", "Successfully fetched");
define("_MSG_CREATED_", "Successfully created");
define("_MSG_DELETED_", "Successfully deleted");
define("_MSG_MODIFIED_", "Successfully modified");
define("_MSG_OBJECT_NOT_FOUND_", "Object not found")
define("_MSG_FAILED_", "Error occurred, check your request or contact administrator");
define("_MSG_UNKNOWN_", "An unknown error occured, contact administrator");
define("_MSG_ARGS_", "Bad JSON body or Argument(s) provided");
define("_MSG_TOKEN_", "Error relevant to token API ('Authorization' header)");
define("_MSG_UNAUTHORIZED_", "Your user is not allowed to access to this resource");
define("_MSG_MISSING_PARAMS_", "Missing params");
define("_MSG_MAIL_EXIST_", "Email is already used");
define("_MSG_GROUP_NAME_EXIST_", "Name is already used");
define("_MSG_ROLE_TITLE_EXIST_", "Title is already used");

/* Definition of global variables */
define("_TRUE_", "true");
define("_MSG_WELCOME_", "Welcome message");


// Methods technical names
Action.find({}, function(err, actions) {
	if(err) console.error(err);
	actions.forEach(function(action) {
		if(Utils.isNotEmpty(action.technical_title) && Utils.isNotEmpty(action._id)) {
			try{
				define(action.technical_title, action._id);
			} catch (ex) {
				console.error(ex);
			}

		}
	});
});


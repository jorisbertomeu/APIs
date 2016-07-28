function define(name, value) {
    Object.defineProperty(exports, name, {
	value:      value,
	enumerable: true
    });
}

/* Definition of code returned by API */
define("_CODE_CREATED_", 1);
define("_CODE_DELETED_", 2);
define("_CODE_MODIFIED_", 3);
define("_CODE_FAILED_", -1);

/* Definition of message returned by API */
define("_MSG_CREATED_", "Successfully created");

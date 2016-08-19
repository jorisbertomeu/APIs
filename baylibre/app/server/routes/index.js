// Controllers
var BoardsController 			= require('../controllers/boards');
var LabsController 				= require('../controllers/labs');
var Board_instancesController 	= require('../controllers/board_instances');
var CustomersController 		= require('../controllers/customers');
var UsersController 			= require('../controllers/users');
var ProjectController 			= require('../controllers/projects');
var TestCaseController 			= require('../controllers/test_case');
var TestSuiteController 		= require('../controllers/test_suite');
var SocsController 				= require('../controllers/socs');
var GroupsController 			= require('../controllers/groups');
var RolesController 			= require('../controllers/roles');
var ActionsController 			= require('../controllers/actions');

// Models
var User = require('../models/user');

// Utils
var Utils = require('../utils');

module.exports = function(app, express) {
    var router = express.Router();
    var tmp = 0;
    
    router.use(function(req, res, next) {
	var allowedRes = ["/", "/login", "/forgot"];
	
	if (!Utils.publicAccess(allowedRes, req.originalUrl)) {
	    console.log('=> Endpoint ' + req.originalUrl + ' needs token authentication');
	    if (!req.headers.hasOwnProperty('authorization'))
	 	return res.send({message: Utils.Constants._MSG_TOKEN_, details: "You must provide a token API", code: Utils.Constants._CODE_TOKEN_});
	    User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
		if (err)
		    return Utils.sendError(res, err);
		if (!user) {
		    return res.send({message: Utils.Constants._MSG_TOKEN_, details: "Token API unknown", code: Utils.Constants._CODE_TOKEN_});
		}
		next();
	    });
	} else {
	    console.log('=> Endpoint ' + req.originalUrl + ' doesn\'t need token authentication');
	    next();
	}
    });

    router.get('/', function(req, res) {
	res.json({message: Utils.Constants._MSG_WELCOME_, details: global.config.global.welcomeMessage, code: Utils.Constants._CODE_WELCOME_});	
    });

    /* BOARDS RES */
    router.route('/boards')
	.post(BoardsController._postL1)
	.get(BoardsController._getL1);
    router.route('/boards/:board_id')
	.get(BoardsController._getL2)
	.delete(BoardsController._deleteL2)
	.put(BoardsController._putL2);
    
    /* LABS RES */
    router.route('/labs')
	.post(LabsController._postL1)
	.get(LabsController._getL1);
    router.route('/labs/:lab_id')
	.get(LabsController._getL2)
	.delete(LabsController._deleteL2)
	.put(LabsController._putL2);

    /* BOARD_INSTANCES RES */
    router.route('/board_instances')
	.post(Board_instancesController._postL1)
	.get(Board_instancesController._getL1);
    router.route('/board_instances/:board_id')
	.get(Board_instancesController._getL2)
	.delete(Board_instancesController._deleteL2)
	.put(Board_instancesController._putL2);

    /* CUSTOMERS RES */
    router.route('/customers')
	.post(CustomersController._postL1)
	.get(CustomersController._getL1);
    router.route('/customers/:customer_id')
	.get(CustomersController._getL2)
	.delete(CustomersController._deleteL2)
	.put(CustomersController._putL2);

    /* USERS RES */
    router.route('/users')
	.post(UsersController._create_user)
	.get(UsersController._get_users);
    router.route('/forgot')
	.post(UsersController._postL1_forgot);
    router.route('/forgot/:forgot_id/:hash')
	.get(UsersController._getL3_forgot);
    router.route('/login')
	.post(UsersController._postL1_login);
    router.route('/logout')
	.post(UsersController._postL1_logout);
    router.route('/user/:user_id')
	.get(UsersController._get_user_by_id)
	.put(UsersController._update_user)
	.delete(UsersController._delete_user);
	router.route('/users/find/:requestString')
	.get(UsersController._find_user)

    /* PROJECT RES */
    router.route('/projects')
	.post(ProjectController._postL1)
	.get(ProjectController._getL1);
    router.route('/projects/:project_id')
	.get(ProjectController._getL2)
	.put(ProjectController._putL2)
	.delete(ProjectController._deleteL2);

    /* Test case*/
    router.route('/test_case')
	.post(TestCaseController._postL1)
	.get(TestCaseController._getL1);
    router.route('/test_case/:test_case_id')
	.put(TestCaseController._putL2)
	.get(TestCaseController._getL2)
	.delete(TestCaseController._deleteL2);

	/* Test suite*/
    router.route('/test_suite')
	.post(TestSuiteController._postL1)
	.get(TestSuiteController._getL1);
    router.route('/test_suite/:test_suite_id')
	.put(TestSuiteController._putL2)
	.get(TestSuiteController._getL2)
	.delete(TestSuiteController._deleteL2);

	/* Socs routes */
	router.route('/soc')
	.post(SocsController._postL1)
	.get(SocsController._getL1);
	router.route('/soc/:soc_id')
	.put(SocsController._putL2)
	.get(SocsController._getL2)
	.delete(SocsController._deleteL2);

	/* Group routes */
	router.route('/group')
	.post(GroupsController._create_group)
	.get(GroupsController._get_groups);
	router.route('/group/:group_id')
	.put(GroupsController._update_group)
	.get(GroupsController._get_group)
	.delete(GroupsController._delete_group);
	router.route('/group/user_role')
	.post(GroupsController._add_user_role)
	.delete(GroupsController._remove_user_role);
	router.route('/group/board_instance')
	.post(GroupsController._add_board_instance);
	//.get(GroupsController._getListBoardInstances);
	router.route('/group/board_instance/:board_instance_id')
	.delete(GroupsController._remove_board_instance);
	router.route('/group/add_user_in_board_instance')
	.post(GroupsController._add_user_board_instance)
	.delete(GroupsController._remove_user_board_instance);


	/* Role routes */
	router.route('/roles')
	.get(RolesController._get_roles);
	router.route('/role')
	.post(RolesController._create_role);
	router.route('/role/:role_id')
	.put(RolesController._update_role)
	.get(RolesController._get_role)
	.delete(RolesController._delete_role);

	/* Actions routes */
	router.route('/actions')
	.get(ActionsController._get_actions);
	router.route('/action/:id_action')
	.put(ActionsController._update_action)
	.get(ActionsController._get_action);

    
    app.use('/', router);
};

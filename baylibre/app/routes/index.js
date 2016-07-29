var BoardsController = require('../controllers/boards');
var LabsController = require('../controllers/labs');
var Board_instancesController = require('../controllers/board_instances');
var CustomersController = require('../controllers/customers');
var UsersController = require('../controllers/users');
var ProjectController = require('../controllers/projects');
var TestCaseController = require('../controllers/test_case');
var TestSuiteController = require('../controllers/test_suite');
var User = require('../models/user');
var Utils = require('../utils');

module.exports = function(app, express) {
    var router = express.Router();
    var tmp = 0;
    
    router.use(function(req, res, next) {
	var allowedRes = ["/", "/login", "/forgot"];
	
	if (!Utils.publicAccess(allowedRes, req.originalUrl)) {
	    console.log('=> Endpoint ' + req.originalUrl + ' needs token authentication');
	    if (!req.headers.hasOwnProperty('authorization'))
	 	return res.send({'error': 'No token API provided'});
	    User.findOne({'user_tokens': req.headers.authorization}, function(err, user) {
		if (err)
		    return res.send(err);
		if (!user) {
		    return res.send({'error': 'No user found for this token'});
		}
		next();
	    });
	} else {
	    console.log('=> Endpoint ' + req.originalUrl + ' doesn\'t need token authentication');
	    next();
	}
    });

    router.get('/', function(req, res) {
	res.json({ message: 'Hooray! Welcome to our private API! Made with <3 by Joris Bertomeu <joris.bertomeu@epitech.eu>' });	
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
	.post(UsersController._postL1)
	.get(UsersController._getL1);
    router.route('/forgot')
	.post(UsersController._postL1_forgot);
    router.route('/forgot/:forgot_id/:hash')
	.get(UsersController._getL3_forgot);
    router.route('/login')
	.post(UsersController._postL1_login);
    router.route('/logout')
	.post(UsersController._postL1_logout);
    router.route('/users/:user_id')
	.get(UsersController._getL2)
	.delete(UsersController._deleteL2)
	.put(UsersController._putL2);

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

	/* Test case*/
	router.route('/test_suite')
	.post(TestSuiteController._postL1)
	.get(TestSuiteController._getL1);
	router.route('/test_suite/:test_suite_id')
	.put(TestSuiteController._putL2)
	.get(TestSuiteController._getL2)
	.delete(TestSuiteController._deleteL2);

    
    app.use('/', router);
};

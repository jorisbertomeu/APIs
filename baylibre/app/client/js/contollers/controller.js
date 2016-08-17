Array.prototype.removeObject = function(obj, comp) {
    for (var i in this) {

        if (obj[comp] == this[i][comp]) {
            this.splice(i, 1);
        }

    }
}

Array.prototype.lastElement = function() {

    return this[this.length - 1];
}

Array.prototype.addOrUpdate = function(object) {
    for (var i = 0; i < this.length; i++) {
        if (this[i]._id.toString() == object._id.toString()) {
            this[i].stat += 1;
            return;
        }
    }

    object.stat = 1;
    this.push(object);

};

function appController($scope, $http) {

    console.log("********* in controller : appController **************");

    $scope.robot = {};

    $scope.askedData = {};
    $scope.pattern = /^\$.*\$.*/;
    $scope.patternReplace = /^\$(.+?)\$/;

    $scope.graphRobots = [];
    $scope.graphClients = [];
    $scope.graphReplies = [];

    $http.get("/initConv").success(function(response) {

        console.log("********* in controller : initConv **************");

        $scope.conversation = [];
        //$scope.conversation[0] = {};
        $scope.convRobot = {};
        $scope.convRobot.convRobot = response;
        //$scope.conversation.push({robot: response.phrase});

    });

    $http.get("/robots").success(function(response) {

        //console.log("success", response);
        $scope.robots = response;

    });

    $scope.addObject = function(type) {

        console.log("********* in controller : addObject **************");
        if (type === "robot") {
            console.log($scope.robot);
            $scope.robots.push($scope.robot);
            $http.post("/addRobot", $scope.robot).success(function(response) {

                console.log(response);

                $scope.robots.push(response);
                $scope.robot = {};

            });
        }

        if (type === "client") {
            if ($scope.robot._id) {
                $scope.client.robot = $scope.robot._id;
            }
            else {
                console.error("error : id of robot not set", "please select a robot");
            }
            $http.post("/addClient", $scope.client).success(function(response) {

                console.log(response);

                $scope.clients.push(response);
                $scope.client = {};

            });
        }

        if (type === "reply") {
            if ($scope.client._id) {
                $scope.reply.client = $scope.client._id;
                $http.post("/addReply", $scope.reply).success(function(response) {

                    console.log(response);

                    $scope.replies.push(response);
                    $scope.reply = {};

                });
            }
            else {
                console.error("error : id of client not set", "please select a client");
            }

        }


    };

    $scope.deleteObject = function(type, object) {

        console.log("********* in controller : deleteObject **************");


        if (type === 'robot') {
            $http.post("/deleteRobot", object).success(function(response) {
                $scope.robots.removeObject(object, "_id");
                $scope.robot = {};
            });
        }

        if (type === 'client') {
            $http.post("/deleteClient", object).success(function(response) {
                $scope.clients.removeObject(object, "_id");
                $scope.client = {};
            });
        }

        if (type === 'reply') {
            $http.post("/deleteReply", object).success(function(response) {
                $scope.replies.removeObject(object, "_id");
                $scope.reply = {};
            });
        }


    };

    $scope.selectObject = function(type, object) {
        console.log("********* in controller : selectObject **************");
        //console.log(object);
        if (type === "robot") {
            $scope.robot = object;
            //console.log($scope.robot);
            $http.post("/robotClients", $scope.robot).success(function(response) {

                console.log(response);

                $scope.clients = response;
                $scope.replies = [];
                $scope.client = {};
                $scope.reply = {};

            });
        }

        if (type === "client") {
            $scope.client = object;
            $http.post("/clientReplies", $scope.client).success(function(response) {

                console.log(response);

                $scope.replies = response;
                $scope.reply = {};

            });
        }

        if (type === "reply") {
            $scope.reply = object;
            var lier = [].slice.call(document.getElementsByClassName("lier"));
            lier = document.getElementsByClassName("lier");

            //console.log(lier.length);
            for (var key = 0; key < lier.length; key++) {
                //console.log(key);
                lier[key].style.display = "block";
            }
        }
    };

    $scope.updateObject = function(type, object) {

        console.log("********* in controller : updateObject **************");

        if (type === "robot") {
            $http.post("/updateRobot", object).success(function(response) {
                $scope.robots = response;
                $scope.robot = {};
            });
        }

        if (type === "client") {
            $http.post("/updateClient", object).success(function(response) {
                //$scope.clients.push(response);
                console.log(response);
                $scope.client = {};
            });
        }

        if (type === "reply") {
            $http.post("/updateReply", object).success(function(response) {
                console.log(response);
                //$scope.replies.push(response);
                $scope.reply = {};
            });
        }

    };

    $scope.lierRobot = function(robot) {

        console.log("********* in controller : lierRobot **************");

        $scope.reply.robot = robot._id;
        console.log($scope.reply);

        $scope.updateObject("reply", $scope.reply);

    };

    $scope.initConv = function() {

        console.log("********* in controller : initConv **************");

        $http.get("/initConv").success(function(response) {

            $scope.convRobot = response;
            $scope.conversation.push(response);

        });
    }

    $scope.getConvRobot = function(id) {

        console.log("********* in controller : getConvRobot **************");

        $http.get("/getRobot/" + id).success(function(response) {

            $scope.convRobot = response;
            $scope.conversation.push(response);

        });
    }

    $scope.getConvClient = function(client) {

        console.log("********* in controller : getConvClient **************");
        console.log(client.phrase);
        console.log("asked data :", $scope.askedData);

        var index = $scope.conversation.length;
        $scope.conversation[index] = {};
        $scope.conversation[index].client = client.phrase;
        $scope.conversation[index].robot = $scope.convRobot.phrase + " " + $scope.convRobot.convRobot.phrase;

        $scope.graphClients.addOrUpdate(client);
        if ($scope.convRobot.convRobot) $scope.graphRobots.addOrUpdate($scope.convRobot.convRobot);
        if ($scope.convRobot._id) $scope.graphReplies.addOrUpdate($scope.convRobot);

        //console.log("******* DEBUG : ", $scope.convRobot, "**************");

        drawGraph(prepareGraph($scope.graphRobots, $scope.graphClients, $scope.graphReplies));

        $http.get("/getClient/" + client._id).success(function(reply) {

            $scope.convRobot = reply;
            $scope.convRobot.convRobot = reply.convRobot;

        });

    }

    $scope.autoSimulation = function(iterations) {

        console.log("********* in controller : autoSimulation **************");

        $('#modal').modal('show');

        $scope.msg_wait = "Auto Simulation en cours d'execution !";

        if (!iterations) iterations = 100;

        $scope.conversation = [];
        $scope.convRobot = null;

        $http.get("/autoSimulation/" + iterations).success(function(response) {


            console.log(response);
            $scope.conversation = response.conv;

            $('#modal').modal('hide');

            var robots = response.graphRobots;
            var clients = response.graphClients;
            var replies = response.graphReplies;

            $scope.robots = robots;
            $scope.clients = clients;
            $scope.replies = replies;




            // bulding the graph 
            drawGraph(prepareGraph(robots, clients, replies));



        });


    }

    $scope.newConv = function() {

        console.log("********* in controller : newConv **************");

        $http.get("/initConv").success(function(response) {

            console.log("********* in controller : initConv **************");

            $scope.conversation = [];
            $scope.graphRobots = [];
            $scope.graphClients = [];
            $scope.graphReplies = [];
            $scope.convRobot = {};
            $scope.convRobot.convRobot = response;
            //$scope.conversation.push({robot: response.phrase});

        });

    }

}



angular.module('myApp', [])
    .directive('scrollAfter', function() {
        return function(scope, element, attrs) {
            if (scope.$last) {
                // iteration is complete, do whatever post-processing
                // is necessary
                var s = document.getElementById("conversation");
                s.scrollTop = s.scrollHeight;
                console.info("scrolling");

            }
        };
    });
Array.prototype.removeObject = function(obj, comp) {
    for (var i in this) {

        if (obj[comp] == this[i][comp]) {
            this.splice(i, 1);
        }
    }
};

Array.prototype.lastElement = function() {
    return this[this.length - 1];
};

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
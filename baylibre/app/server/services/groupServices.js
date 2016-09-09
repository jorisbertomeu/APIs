var Group    =   require('../models/group');
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
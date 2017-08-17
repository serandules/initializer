var log = require('logger')('initializers:serandives:users');
var nconf = require('nconf');
var Users = require('model-users');
var Roles = require('model-roles');

var email = 'admin@serandives.com';

module.exports = function (done) {
    var suPass = nconf.get('password');
    if (!suPass) {
        return done('su password cannot be found. Please specify it using SU_PASS');
    }
    Roles.findOne({
        name: 'admin'
    }).exec(function (err, role) {
        if (err) {
            return done(err);
        }
        if (!role) {
            return done('No role with name admin can be found.');
        }
        var user = {
            email: email,
            password: suPass,
            roles: [role.id],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        Users.create(user, function (err, user) {
            if (err) {
                return done(err);
            }
            user.allowed = {
                user: user.id,
                perms: ['read', 'update', 'delete']
            };
            Users.update({_id: user.id}, user, function (err) {
                if (err) {
                    return done(err);
                }
                log.info('users created successfully');
                done();
            });
        });
    });
};
var log = require('logger')('initializers:serandives:groups');

var Users = require('model-users');
var Groups = require('model-groups');

var email = 'admin@serandives.com';

module.exports = function (done) {
    Users.findOne({email: email}, function (err, user) {
        if (err) {
            return done(err);
        }
        Groups.create({
            user: user,
            name: 'admin',
            description: 'serandives.com admin group'
        }, function (err, admin) {
            if (err) {
                return done(err);
            }
            Groups.create({
                user: user,
                name: 'public',
                description: 'serandives.com public group'
            }, function (err, pub) {
                if (err) {
                    return done(err);
                }
                Groups.update({_id: pub._id}, {
                    permissions: [{
                        group: pub._id,
                        actions: ['read']
                    }]
                }, function (err) {
                    if (err) {
                        return done(err);
                    }
                    Users.update({_id: user.id}, {
                        groups: [admin.id, pub.id]
                    }, function (err) {
                        if (err) {
                            return done(err);
                        }
                        log.info('groups:created');
                        done();
                    });
                });
            });
        });
    });
};
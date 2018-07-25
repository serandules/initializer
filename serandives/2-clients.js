var log = require('logger')('initializers:serandives:clients');
var Clients = require('model-clients');
var Users = require('model-users');

var email = 'admin@serandives.com';

var name = 'serandives';

var to = [
    'https://accounts.serandives.com/signin/serandives',
    'https://autos.serandives.com/signin/serandives'
];

module.exports = function (done) {
    Users.findOne({email: email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done('No user with email %s can be found.', email);
        }
        Clients.create({
            name: name,
            user: user,
            to: to,
            has: {
                '*': {
                    '': ['*']
                }
            }
        }, function (err, client) {
            if (err) {
                return done(err);
            }
            log.info('clients:created');
            done();
        });
    });
};
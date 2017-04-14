var log = require('logger')('initializers:serandives:clients');
var Client = require('model-clients');
var User = require('model-users');

var email = 'admin@serandives.com';

var name = 'serandives';

var to = [
    'https://accounts.serandives.com/signin/serandives',
    'https://autos.serandives.com/signin/serandives'
];

module.exports = function (done) {
    User.findOne({email: email}, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done('No user with email %s can be found.', email);
        }
        Client.create({
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
            log.info('clients created successfully');
            done();
        });
    });
};
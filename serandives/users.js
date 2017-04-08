var log = require('logger')('initializer:serandives:users');
var nconf = require('nconf');
var User = require('model-users');

var email = 'admin@serandives.com';

var create = function (ctx, done) {
    User.findOne({
        email: email
    }).exec(function (err, user) {
        if (err) {
            return done(err);
        }
        if (user) {
            ctx.users = {};
            ctx.users[email] = user;
            return done(false, ctx);
        }

        var suPass = nconf.get('password');
        if (!suPass) {
            return done('su password cannot be found. Please specify it using SU_PASS');
        }
        user = {
            email: email,
            password: suPass,
            roles: [ctx.roles.admin]
        };
        User.create(user, function (err, user) {
            if (err) {
                return done(err);
            }
            log.info('users created successfully');
            ctx.users = {};
            ctx.users[email] = user;
            done(false, ctx);
        });
    });
};

module.exports = function (ctx, done) {
    create(ctx, done);
};
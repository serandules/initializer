var log = require('logger')('initializer:hub:configs');
var User = require('user');
var Config = require('config');

var email = 'admin@serandives.com';

var name = 'boot';

var create = function (ctx, done) {
    Config.findOne({
        name: name
    }).exec(function (err, config) {
        if (err) {
            return done(err);
        }

        if (config) {
            ctx.configs = {};
            ctx.configs[name] = config;
            return done(false, ctx);
        }

        var client = ctx.clients['serandives.com'];

        Config.create({
            name: name,
            value: {
                clientId: client.id
            }
        }, function (err, config) {
            if (err) {
                return done(err);
            }
            log.info('configs created successfully');
            ctx.configs = {};
            ctx.configs[name] = config;
            done(false, ctx);
        });
    });
};

module.exports = function (ctx, done) {
    create(ctx, done);
};
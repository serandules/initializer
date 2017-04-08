var log = require('logger')('initializer:serandives:configs');
var nconf = require('nconf');
var async = require('async');
var Config = require('model-configs');

var create = function (ctx, config, done) {
    var name = config.name;
    var value = config.value;
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
        Config.create({
            name: name,
            value: JSON.stringify(value)
        }, function (err, config) {
            if (err) {
                return done(err);
            }
            log.info('configs %s created successfully', name);
            ctx.configs = {};
            ctx.configs[name] = config;
            done(false);
        });
    });
};

module.exports = function (ctx, done) {
    var configs = [];
    var serandivesId = ctx.clients.serandives.id;
    var facebookId = nconf.get('facebookId');
    configs.push({
        name: 'boot',
        value: {
            clients: {
                facebook: nconf.get('facebookId'),
                serandives: serandivesId
            }
        }
    });
    async.each(configs, function (config, done) {
        create(ctx, config, done);
    }, function (err) {
        done(err, ctx);
    });
};
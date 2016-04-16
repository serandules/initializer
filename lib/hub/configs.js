var log = require('logger')('initializer:hub:configs');
var async = require('async');
var Config = hub('config');

var facebookId = '911082242310402';
var facebookSecret = '5ea5fa59190b186a449a47048faa00b1';
var amazonKey = 'AKIAJGHSC4WKREUUKGBQ';
var amazonSecret = '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';

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
    configs.push({
        name: 'facebook',
        value: {
            app: {
                id: facebookId,
                secret: facebookSecret
            }
        }
    });
    configs.push({
        name: 'amazon',
        value: {
            s3: {
                key: amazonKey,
                secret: amazonSecret
            }
        }
    });
    configs.push({
        name: 'boot',
        value: {
            clients: {
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
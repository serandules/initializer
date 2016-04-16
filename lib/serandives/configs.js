var log = require('logger')('initializer:serandives:configs');
var async = require('async');
var User = require('user');
var Config = require('config');
var HConfig = hub('config');

var facebookId = '911082242310402';

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
    HConfig.findOne({
        name: 'facebook'
    }, function (err, config) {
        if (err) return done(err);
        if (!config) return done('!facebook');
        config = JSON.parse(config.value)
        configs.push({
            name: 'boot',
            value: {
                clients: {
                    facebook: config.app.id,
                    serandives: serandivesId
                }
            }
        });
        async.each(configs, function (config, done) {
            create(ctx, config, done);
        }, function (err) {
            done(err, ctx);
        });
    })
};
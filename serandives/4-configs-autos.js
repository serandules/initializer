var log = require('logger')('initializers:serandives:configs');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var Configs = require('model-configs');
var Groups = require('model-groups');
var Clients = require('model-clients');

var clientName = 'serandives';

var create = function (user, config, added) {
    var name = config.name;
    var value = config.value;
    Configs.findOne({
        name: name
    }).exec(function (err, config) {
        if (err) {
            return added(err);
        }
        if (config) {
            return added();
        }
        Configs.create({
            user: user,
            name: name,
            value: JSON.stringify(value)
        }, function (err, config) {
            if (err) {
                return added(err);
            }
            log.info('configs:created', 'name:%s', name);
            added();
        });
    });
};

module.exports = function (done) {
    var configs = [];
    Clients.findOne({name: clientName}).exec(function (err, client) {
        if (err) {
            return done(err);
        }
        if (!client) {
            return done('No client with name %s can be found.', clientName);
        }
        var boot = nconf.get('CONFIG_BOOT_AUTOS');
        var value = {};
        boot = boot.split('|');
        boot.forEach(function (b) {
            value[b.substring(0, b.indexOf(':'))] = b.substring(b.indexOf(':') + 1);
        });
        configs.push({
            user: client.user,
            name: 'boot-autos',
            value: value
        })
        async.each(configs, function (config, added) {
            create(client.user, config, added);
        }, done);
    });
};
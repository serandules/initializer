var log = require('logger')('initializers:serandives:configs');
var nconf = require('nconf');
var async = require('async');
var Config = require('model-configs');
var Client = require('model-clients');

var clientName = 'serandives';

var create = function (config, added) {
    var name = config.name;
    var value = config.value;
    Config.findOne({
        name: name
    }).exec(function (err, config) {
        if (err) {
            return added(err);
        }
        if (config) {
            return added();
        }
        Config.create({
            name: name,
            value: JSON.stringify(value)
        }, function (err, config) {
            if (err) {
                return added(err);
            }
            log.info('configs %s created successfully', name);
            added();
        });
    });
};

module.exports = function (done) {
    var configs = [];
    Client.findOne({name: clientName}).exec(function (err, client) {
        if (err) {
            return done(err);
        }
        if (!client) {
            return done('No client with name %s can be found.', clientName);
        }
        var facebookId = nconf.get('facebookId');
        var serandivesId = client.id;
        configs.push({
            name: 'boot',
            value: {
                clients: {
                    facebook: facebookId,
                    serandives: serandivesId
                }
            }
        });
        async.each(configs, function (config, added) {
            create(config, added);
        }, done);
    });
};
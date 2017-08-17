var log = require('logger')('initializers:serandives:configs');
var nconf = require('nconf');
var async = require('async');
var Configs = require('model-configs');
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
            log.info('configs %s created successfully', name);
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
        var facebookId = nconf.get('facebookId');
        var serandivesId = client.id;
        configs.push({
            user: client.user,
            name: 'boot',
            value: {
                clients: {
                    facebook: facebookId,
                    serandives: serandivesId
                }
            }
        });
        async.each(configs, function (config, added) {
            create(client.user, config, added);
        }, done);
    });
};
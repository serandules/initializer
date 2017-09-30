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
        var facebookId = nconf.get('FACEBOOK_ID');
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
        Groups.find({user: client.user, name: {$in: ['public']}}, function (err, groups) {
            if (err) {
                return done(err);
            }
            configs.push({
                user: client.user,
                name: 'groups',
                value: _.map(groups, function (group) {
                    return {id: group.id, name: group.name, description: group.description}
                })
            });
            async.each(configs, function (config, added) {
                create(client.user, config, added);
            }, done);
        });
    });
};
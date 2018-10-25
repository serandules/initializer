var log = require('logger')('initializers:serandives:configs');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var utils = require('utils');
var Configs = require('model-configs');
var Groups = require('model-groups');
var Clients = require('model-clients');

var space = utils.space();

var create = function (user, config, added) {
  var name = config.name;
  var value = config.value;
  var permissions = config.permissions;
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
      value: JSON.stringify(value),
      permissions: permissions
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
  Clients.findOne({name: space}).exec(function (err, client) {
    if (err) {
      return done(err);
    }
    if (!client) {
      return done('No client with name %s can be found.', space);
    }
    Groups.find({user: client.user, name: {$in: ['public', 'admin']}}, function (err, groups) {
      if (err) {
        return done(err);
      }
      var facebookId = nconf.get('FACEBOOK_ID');
      var googleKey = nconf.get('GOOGLE_KEY');
      var serandivesId = client.id;
      var groupz = {};
      groups.forEach(function (group) {
        groupz[group.name] = group;
      });
      var permissions = [{
        user: client.user,
        actions: ['read', 'update', 'delete']
      }, {
        group: groupz.admin._id,
        actions: ['read', 'update', 'delete']
      }, {
        group: groupz.public._id,
        actions: ['read']
      }];
      // boots
      configs.push({
        user: client.user,
        name: 'boot',
        value: {
          clients: {
            facebook: facebookId,
            serandives: serandivesId
          },
          googleKey: googleKey
        },
        permissions: permissions
      });
      // groups
      configs.push({
        user: client.user,
        name: 'groups',
        value: [{
          id: groupz.public.id,
          name: groupz.public.name,
          description: groupz.public.description
        }],
        permissions: permissions
      });
      async.each(configs, function (config, added) {
        create(client.user, config, added);
      }, done);
    });
  });
};
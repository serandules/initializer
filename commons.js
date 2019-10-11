var utils = require('utils');
var Users = require('model-users');
var Clients = require('model-clients');
var Groups = require('model-groups');
var Workflows = require('model-workflows');

var email = utils.root();
var domain = utils.domain();

exports.meta = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    Clients.findOne({name: domain}).exec(function (err, client) {
      if (err) {
        return done(err);
      }
      if (!client) {
        return done('No client with name %s can be found.', domain);
      }
      Workflows.findOne({user: user, name: 'model'}, function (err, workflow) {
        if (err) {
          return done(err);
        }
        Groups.find({user: client.user, name: {$in: ['public', 'admin', 'anonymous']}}, function (err, groups) {
          if (err) {
            return done(err);
          }
          var groupz = {};
          groups.forEach(function (group) {
            groupz[group.name] = group;
          });
          var permissions = [{
            user: client.user,
            actions: ['read', 'update', 'delete', 'unpublish']
          }, {
            group: groupz.admin._id,
            actions: ['read', 'update', 'delete', 'unpublish']
          }, {
            group: groupz.public._id,
            actions: ['read']
          }, {
            group: groupz.anonymous._id,
            actions: ['read']
          }];
          var visibility = {
            '*': {
              users: [client.user._id],
              groups: [groupz.admin._id]
            }
          };
          done(null, {
            user: user,
            client: client,
            permissions: permissions,
            visibility: visibility,
            workflow: workflow,
            admin: groupz.admin,
            public: groupz.public,
            anonymous: groupz.anonymous
          });
        });
      });
    });
  });
};

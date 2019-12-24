var utils = require('utils');
var Users = require('model-users');
var Clients = require('model-clients');
var Groups = require('model-groups');
var Workflows = require('model-workflows');

var adminUser = utils.adminEmail();
var supportUser = utils.supportEmail();
var talkUser = utils.talkEmail();
var domain = utils.domain();

exports.meta = function (done) {
  Users.findOne({email: adminUser}, function (err, adminUser) {
    if (err) {
      return done(err);
    }
    Users.findOne({email: supportUser}, function (err, supportUser) {
      if (err) {
        return done(err);
      }
      Users.findOne({email: talkUser}, function (err, talkUser) {
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
          Workflows.findOne({user: adminUser, name: 'model'}, function (err, workflow) {
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
                adminUser: adminUser,
                supportUser: supportUser,
                talkUser: talkUser,
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
    });
  });
};

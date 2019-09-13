var log = require('logger')('initializers:serandives:clients');
var utils = require('utils');
var Clients = require('model-clients');
var Users = require('model-users');
var Groups = require('model-groups');
var Workflows = require('model-workflows');

var email = utils.root();

var domain = utils.domain();

var to = [
  utils.resolve('accounts://'),
  utils.resolve('accounts:///auth'),
  utils.resolve('admin:///auth'),
  utils.resolve('autos:///auth')
];

module.exports = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done('No user with email %s can be found.', email);
    }
    Groups.findOne({user: user, name: 'admin'}, function (err, admin) {
      if (err) {
        return done(err);
      }
      Groups.findOne({user: user, name: 'public'}, function (err, public) {
        if (err) {
          return done(err);
        }
        Groups.findOne({user: user, name: 'anonymous'}, function (err, anonymous) {
          if (err) {
            return done(err);
          }
          Workflows.findOne({user: user, name: 'model-clients'}, function (err, workflow) {
            if (err) {
              return done(err);
            }
            Clients.create({
              name: domain,
              description: 'Client for ' + domain,
              user: user,
              to: to,
              permissions: [{
                user: user._id,
                actions: ['read', 'update', 'delete', 'move']
              }, {
                group: admin._id,
                actions: ['read', 'update', 'delete', 'move']
              }, {
                group: public._id,
                actions: ['read']
              }, {
                group: anonymous._id,
                actions: ['read']
              }],
              visibility: {
                '*': {
                  users: [user._id],
                  groups: [admin._id]
                },
                name: {
                  groups: [public._id, anonymous._id]
                },
                description: {
                  groups: [public._id, anonymous._id]
                },
                to: {
                  groups: [public._id, anonymous._id]
                }
              },
              workflow: workflow,
              status: 'production',
              _: {}
            }, function (err, client) {
              if (err) {
                return done(err);
              }
              log.info('clients:created');
              done();
            });
          });
        });
      });
    });
  });
};

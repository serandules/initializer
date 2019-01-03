var log = require('logger')('initializers:serandives:clients');
var utils = require('utils');
var Clients = require('model-clients');
var Users = require('model-users');
var Groups = require('model-groups');

var email = utils.root();

var space = utils.space();

var to = [
    utils.resolve('accounts://'),
    utils.resolve('accounts:///auth'),
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
        Clients.create({
          name: space,
          user: user,
          to: to,
          has: {
            '*': {
              '': ['*']
            }
          },
          permissions: [{
            user: user._id,
            actions: ['read', 'update', 'delete']
          }, {
            group: admin._id,
            actions: ['read', 'update', 'delete']
          }],
          visibility: {
            '*': {
              users: [user._id],
              groups: [admin._id]
            }
          }
        }, function (err, client) {
          if (err) {
            return done(err);
          }
          log.info('clients:created');
          done();
        });
      });
    });
};
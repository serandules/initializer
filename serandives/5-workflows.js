var log = require('logger')('initializers:serandives:workflows');
var utils = require('utils');
var Workflows = require('model-workflows');
var Users = require('model-users');
var Groups = require('model-groups');

var email = utils.root();

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
      Workflows.update({
        name: 'model',
        user: user
      }, {
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
      }, function (err, workflow) {
        if (err) {
          return done(err);
        }
        log.info('workflow:updated');
        done();
      });
    });
  });
};


/*
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
},*/

var log = require('logger')('initializers:serandives:groups');

var utils = require('utils');
var Users = require('model-users');
var Groups = require('model-groups');

var email = utils.root();

module.exports = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    Groups.create({
      user: user,
      name: 'admin',
      description: 'serandives.com admin group'
    }, function (err, admin) {
      if (err) {
        return done(err);
      }
      Groups.update({_id: admin._id}, {
        permissions: [{
          user: user._id,
          actions: ['read', 'update', 'delete']
        }, {
          group: admin._id,
          actions: ['read', 'update', 'delete']
        }]
      }, function (err) {
        if (err) {
          return done(err);
        }
        Groups.create({
          user: user,
          name: 'public',
          description: 'serandives.com public group'
        }, function (err, pub) {
          if (err) {
            return done(err);
          }
          Groups.update({_id: pub._id}, {
            permissions: [{
              user: user._id,
              actions: ['read', 'update', 'delete']
            }, {
              group: admin._id,
              actions: ['read', 'update', 'delete']
            }, {
              group: pub._id,
              actions: ['read']
            }]
          }, function (err) {
            if (err) {
              return done(err);
            }
            Users.update({_id: user.id}, {
              groups: [admin.id, pub.id]
            }, function (err) {
              if (err) {
                return done(err);
              }
              log.info('groups:created');
              done();
            });
          });
        });
      });
    });
  });
};
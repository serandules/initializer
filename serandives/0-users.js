var log = require('logger')('initializers:serandives:users');
var nconf = require('nconf');
var utils = require('utils');
var Users = require('model-users');

var email = utils.root();

module.exports = function (done) {
    var suPass = nconf.get('PASSWORD');
    if (!suPass) {
        return done('su password cannot be found');
    }
    utils.encrypt(suPass, function (err, encrypted) {
      if (err) {
        return done(err);
      }
      var user = {
        email: email,
        password: encrypted,
        alias: 'admin',
        status: 'registered',
        createdAt: new Date(),
        updatedAt: new Date(),
        _: {}
      };
      Users.create(user, function (err, user) {
        if (err) {
          return done(err);
        }
        Users.update({_id: user._id}, {
          permissions: [{
            user: user._id,
            actions: ['read', 'update', 'delete']
          }],
          visibility: {
            '*': {
              users: [user._id]
            }
          }
        }, function (err) {
          if (err) {
            return done(err);
          }
          log.info('users:created');
          done();
        });
      });
    });
};

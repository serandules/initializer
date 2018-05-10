var log = require('logger')('initializers:serandives:tiers');

var Users = require('model-users');
var Tiers = require('model-tiers');

var email = 'admin@serandives.com';

module.exports = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    Tiers.create({
      user: user,
      name: 'free',
      description: 'serandives.com free tier',
      limits: {
        vehicles: {
          find: {
            second: 100,
            day: 10000,
            month: 100000
          },
          create: {
            second: 1,
            day: 10,
            month: 100
          }
        }
      }
    }, function (err, free) {
      if (err) {
        return done(err);
      }
      Tiers.create({
        user: user,
        name: 'unlimited',
        description: 'serandives.com unlimited tier',
        limits: {
          '*': {
            '*': {
              second: Number.MAX_VALUE,
              day: Number.MAX_VALUE,
              month: Number.MAX_VALUE
            }
          }
        }
      }, function (err, admin) {
        if (err) {
          return done(err);
        }
        log.info('tiers created successfully');
        done();
      });
    });
  });
};
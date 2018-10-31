var log = require('logger')('initializers:serandives:tiers');

var utils = require('utils');
var Users = require('model-users');
var Tiers = require('model-tiers');

var email = utils.root();

module.exports = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    Tiers.create({
      user: user,
      name: 'free',
      description: 'serandives.com free tier',
      apis: {
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
      },
      ips: {
        find: {
          second: 10,
          minute: 500,
          hour: 5000,
          day: 50000
        },
        create: {
          second: 10,
          minute: 100,
          hour: 500,
          day: 1000
        }
      }
    }, function (err, free) {
      if (err) {
        return done(err);
      }
      Tiers.create({
        user: user,
        name: 'basic',
        description: 'serandives.com basic tier',
        apis: {
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
        },
        ips: {
          find: {
            second: 10,
            minute: 500,
            hour: 5000,
            day: 50000
          },
          create: {
            second: 10,
            minute: 100,
            hour: 500,
            day: 1000
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
          apis: {
            '*': {
              '*': {
                second: Number.MAX_VALUE,
                day: Number.MAX_VALUE,
                month: Number.MAX_VALUE
              }
            }
          },
          ips: {
            '*': {
              second: Number.MAX_VALUE,
              day: Number.MAX_VALUE,
              month: Number.MAX_VALUE
            }
          }
        }, function (err, admin) {
          if (err) {
            return done(err);
          }
          log.info('tiers:created');
          done();
        });
      });
    });
  });
};
var log = require('logger')('initializers:serandives:tiers');
var Tiers = require('model-tiers');
var commons = require('../commons');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    Tiers.create({
      user: o.user,
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
      },
      workflow: o.workflow,
      status: o.workflow.start,
      _: {}
    }, function (err, free) {
      if (err) {
        return done(err);
      }
      Tiers.create({
        user: o.user,
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
        },
        workflow: o.workflow,
        status: o.workflow.start,
        _: {}
      }, function (err, free) {
        if (err) {
          return done(err);
        }
        Tiers.create({
          user: o.user,
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
          },
          workflow: o.workflow,
          status: o.workflow.start,
          _: {}
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

var log = require('logger')('initializers:serandives:workflows');
var utils = require('utils');
var Workflows = require('model-workflows');
var Users = require('model-users');
var Groups = require('model-groups');

var email = utils.root();

var space = utils.space();

module.exports = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done('No user with email %s can be found.', email);
    }
    workflowModel(user, function (err) {
      if (err) {
        return done(err);
      }
      workflowModelUsers(user, function (err) {
        if (err) {
          return done(err);
        }
        log.info('workflow:created');
        done();
      });
    });
  });
};

var workflowModel = function (user, done) {
  Workflows.create({
    name: 'model',
    user: user,
    _: {},
    start: 'editing',
    transitions: {
      editing: {
        review: 'reviewing'
      },
      reviewing: {
        approve: 'unpublished',
        reject: 'editing'
      },
      published: {
        unpublish: 'unpublished'
      },
      unpublished: {
        publish: 'published',
        edit: 'editing'
      }
    },
    permits: {
      editing: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          }
        },
        user: {
          actions: ['read', 'update', 'delete', 'review'],
          visibility: ['*']
        }
      },
      reviewing: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          }
        },
        user: {
          actions: ['read', 'delete'],
          visibility: ['*']
        }
      },
      published: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          },
          public: {
            actions: ['read'],
            visibility: ['*']
          },
          anonymous: {
            actions: ['read'],
            visibility: ['*']
          }
        },
        user: {
          actions: ['read', 'unpublish'],
          visibility: ['*']
        }
      },
      unpublished: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          }
        },
        user: {
          actions: ['read', 'delete', 'publish', 'edit'],
          visibility: ['*']
        }
      }
    }
  }, done);
};


var workflowModelUsers = function (user, done) {
  Workflows.create({
    name: 'model-users',
    user: user,
    _: {},
    start: 'signup',
    transitions: {
      signup: {
        verify: 'registered'
      },
      registered: {
        recover: 'registered',
        block: 'blocked'
      },
      blocked: {
        unblock: 'registered'
      }
    },
    permits: {
      signup: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          }
        },
        user: {
          actions: ['read', 'verify'],
          visibility: ['*']
        }
      },
      registered: {
        groups: {
          admin: {
            actions: ['*'],
            visibility: ['*']
          },
          public: {
            actions: ['read'],
            visibility: ['id', 'alias']
          },
          anonymous: {
            actions: ['read'],
            visibility: ['id', 'alias']
          }
        },
        user: {
          actions: ['read', 'update', 'recover', 'block'],
          visibility: ['*']
        }
      },
      blocked: {
        groups: {
          admin: {
            actions: ['*', 'unblock'],
            visibility: ['*']
          }
        },
        user: {
          actions: ['read', 'update'],
          visibility: ['*']
        }
      }
    }
  }, done);
};

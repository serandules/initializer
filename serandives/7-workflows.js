var log = require('logger')('initializers:serandives:workflows');
var Workflows = require('model-workflows');
var commons = require('../commons');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    Workflows.update({
      _id: o.workflow
    }, {
      permissions: [{
        user: o.adminUser._id,
        actions: ['read', 'update', 'delete']
      }, {
        group: o.admin._id,
        actions: ['read', 'update', 'delete']
      }],
      visibility: {
        '*': {
          users: [o.adminUser._id],
          groups: [o.admin._id]
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
};

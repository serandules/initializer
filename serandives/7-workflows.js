var log = require('logger')('initializers:serandives:workflows');
var _ = require('lodash');

var models = require('models');
var Workflows = models.model('workflows');
var commons = require('../commons');

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    Workflows.update({
      _id: {
        $in: _.map(o.workflows, 'id')
      }
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
    }, {multi: true}, function (err) {
      if (err) {
        return done(err);
      }
      log.info('workflows:updated');
      done();
    });
  });
};

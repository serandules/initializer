var log = require('logger')('initializers:serandives:makes');
var async = require('async');

var utils = require('utils');
var Users = require('model-users');
var Workflows = require('model-workflows');
var Groups = require('model-groups');
var VehicleMakes = require('model-vehicle-makes');
var VehicleModels = require('model-vehicle-models');
var commons = require('../commons');

var email = utils.root();

var makes = [
  {title: 'Honda', country: 'Japan', models: [{type: 'suv', title: 'Vezel'}, {type: 'car', title: 'Grace'}]},
  {title: 'Toyota', country: 'Japan', models: [{type: 'suv', title: 'V8'}, {type: 'car', title: 'Corolla'}]},
  {title: 'Mazda', country: 'Japan', models: [{type: 'suv', title: 'CX-5'}, {type: 'car', title: 'Mazda6'}]},
  {title: 'Nissan', country: 'Japan', models: [{type: 'suv', title: 'X-Trail'}, {type: 'car', title: 'Sunny'}]}
];

var createModels = function (user, pub, anon, make, models, workflow, done) {
  async.eachLimit(models, 10, function (model, modeled) {
    model.user = make.user;
    model.make = make;
    model.permissions = [{
      user: user.id,
      actions: ['read', 'update', 'delete']
    }, {
      group: pub._id,
      actions: ['read']
    }, {
      group: anon._id,
      actions: ['read']
    }];
    model.visibility = {
      '*': {
        users: [user._id],
        groups: [pub._id, anon._id]
      }
    };
    model.workflow = workflow;
    model.status = workflow.start;
    model._ = {};
    VehicleModels.create(model, function (err, o) {
      if (err) {
        return modeled(err);
      }
      log.info('models:created', 'title:%s', o.title);
      modeled();
    });
  }, done);
};

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    async.eachLimit(makes, 10, function (make, made) {
      VehicleMakes.findOne({title: make.title}).exec(function (err, oo) {
        if (err) {
          return made(err);
        }
        if (oo) {
          return createModels(o.user, o.public, o.anonymous, oo, make.models, o.workflow, made);
        }
        make.user = o.user;
        make.permissions = o.permissions;
        make.visibility = o.visibility;
        make.workflow = o.workflow;
        make.status = o.workflow.start;
        make._ = {};
        VehicleMakes.create(make, function (err, oo) {
          if (err) {
            return made(err);
          }
          log.info('makes:created', 'title:%s', oo.title);
          createModels(o.user, o.public, o.anonymous, oo, make.models, o.workflow, made);
        });
      });
    }, done);
  });
};

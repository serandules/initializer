var log = require('logger')('initializers:serandives:makes');
var async = require('async');

var Users = require('model-users');
var Groups = require('model-groups');
var VehicleMakes = require('model-vehicle-makes');
var VehicleModels = require('model-vehicle-models');

var email = 'admin@serandives.com';

var makes = [
  {title: 'Honda', country: 'Japan', models: [{type: 'suv', title: 'Vezel'}, {type: 'car', title: 'Grace'}]},
  {title: 'Toyota', country: 'Japan', models: [{type: 'suv', title: 'V8'}, {type: 'car', title: 'Corolla'}]},
  {title: 'Mazda', country: 'Japan', models: [{type: 'suv', title: 'CX-5'}, {type: 'car', title: 'Mazda6'}]},
  {title: 'Nissan', country: 'Japan', models: [{type: 'suv', title: 'X-Trail'}, {type: 'car', title: 'Sunny'}]}
];

var createModels = function (user, group, make, models, done) {
  async.eachLimit(models, 10, function (model, modeled) {
    model.user = make.user;
    model.make = make;
    model.permissions = [{
      user: user.id,
      actions: ['read', 'update', 'delete']
    }, {
      group: group._id,
      actions: ['read']
    }];
    VehicleModels.create(model, function (err, o) {
      if (err) {
        return modeled(err);
      }
      log.info('models:created', 'title:%s', o.title);
      modeled();
    });
  }, done);
}

module.exports = function (done) {
  Users.findOne({email: email}, function (err, user) {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done('No user with email %s can be found.', email);
    }
    Groups.findOne({name: 'public'}, function (err, group) {
      if (err) {
        return done(err);
      }
      if (!group) {
        return done('No public group can be found');
      }
      async.eachLimit(makes, 10, function (make, made) {
        VehicleMakes.findOne({title: make.title}).exec(function (err, o) {
          if (err) {
            return made(err);
          }
          if (o) {
            return createModels(user, group, o, make.models, made);
          }
          make.user = user;
          make.permissions = [{
            user: user.id,
            actions: ['read', 'update', 'delete']
          }, {
            group: group._id,
            actions: ['read']
          }];
          VehicleMakes.create(make, function (err, o) {
            if (err) {
              return made(err);
            }
            log.info('makes:created', 'title:%s', o.title);
            createModels(user, group, o, make.models, made);
          });
        });
      }, done);
    });
  });
};
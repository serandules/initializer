var log = require('logger')('initializer:serandives:makes');
var async = require('async');

var VehicleMake = require('vehicle-make');
var VehicleModel = require('vehicle-model');

var makes = [
    {title: 'Honda', country: 'Japan', models: [{type: 'suv', title: 'Vezel'}, {type: 'car', title: 'Grace'}]},
    {title: 'Toyota', country: 'Japan', models: [{type: 'suv', title: 'V8'}, {type: 'car', title: 'Corolla'}]},
    {title: 'Mazda', country: 'Japan', models: [{type: 'suv', title: 'CX-5'}, {type: 'car', title: 'Mazda6'}]},
    {title: 'Nissan', country: 'Japan', models: [{type: 'suv', title: 'X-Trail'}, {type: 'car', title: 'Sunny'}]}
];

var create = function (ctx, done) {
    VehicleModel.remove(function (err) {
        if (err) {
            return done(err);
        }
        VehicleMake.remove(function (err) {
            if (err) {
                return done(err);
            }
            async.eachLimit(makes, 10, function (make, made) {
                VehicleMake.create(make, function (err, o) {
                    if (err) {
                        return made(err);
                    }
                    log.info('make %s created successfully', o.title);
                    async.eachLimit(make.models, 10, function (model, modeled) {
                        model.make = o;
                        VehicleModel.create(model, function (err, o) {
                            if (err) {
                                return modeled(err);
                            }
                            log.info('model %s created successfully', o.title);
                            modeled();
                        });
                    }, made);
                });
            }, done);
        });
    });
};

module.exports = function (ctx, done) {
    create(ctx, done);
};
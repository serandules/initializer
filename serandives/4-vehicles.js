var log = require('logger')('initializers:serandives:makes');
var async = require('async');

var VehicleMake = require('model-vehicle-makes');
var VehicleModel = require('model-vehicle-models');

var makes = [
    {title: 'Honda', country: 'Japan', models: [{type: 'suv', title: 'Vezel'}, {type: 'car', title: 'Grace'}]},
    {title: 'Toyota', country: 'Japan', models: [{type: 'suv', title: 'V8'}, {type: 'car', title: 'Corolla'}]},
    {title: 'Mazda', country: 'Japan', models: [{type: 'suv', title: 'CX-5'}, {type: 'car', title: 'Mazda6'}]},
    {title: 'Nissan', country: 'Japan', models: [{type: 'suv', title: 'X-Trail'}, {type: 'car', title: 'Sunny'}]}
];

var createModels = function (make, models, done) {
    async.eachLimit(models, 10, function (model, modeled) {
        model.make = make;
        VehicleModel.create(model, function (err, o) {
            if (err) {
                return modeled(err);
            }
            log.info('model %s created successfully', o.title);
            modeled();
        });
    }, done);
}

module.exports = function (done) {
    async.eachLimit(makes, 10, function (make, made) {
        VehicleMake.findOne({title: make.title}).exec(function (err, o) {
            if (err) {
                return made(err);
            }
            if (o) {
                return createModels(o, make.models, made);
            }
            VehicleMake.create(make, function (err, o) {
                if (err) {
                    return made(err);
                }
                log.info('make %s created successfully', o.title);
                createModels(o, make.models, made);
            });
        });
    }, done);
};
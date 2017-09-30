var log = require('logger')('initializers:initialize');
var nconf = require('nconf').argv().env();
var async = require('async');
var mongoose = require('mongoose');
var initializer = require('./index');

mongoose.Promise = global.Promise;

var env = nconf.get('ENV');

nconf.defaults(require('./env/' + env + '.json'));

var mongodbUri = nconf.get('MONGODB_URI');

mongoose.connect(mongodbUri);
var db = mongoose.connection;
db.on('error', function (err) {
    log.error('mongodb connection error: %e', err);
});
db.once('open', function () {
    log.debug('connected to mongodb : ' + mongodbUri);
    initializer.init(function (err) {
        if (err) {
            return log.error(err);
        }
        mongoose.disconnect(function () {
            log.info('successfully initialized');
        });
    });
});
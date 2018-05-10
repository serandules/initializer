var log = require('logger')('initializers:initialize');
var nconf = require('nconf').argv().env();
var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
var initializer = require('./index');

mongoose.Promise = global.Promise;

var env = nconf.get('ENV');

nconf.defaults(require('./env/' + env + '.json'));

var mongourl = nconf.get('MONGODB_URI');

var ssl = (env === 'production');

mongoose.connect(mongourl, {
    authSource: 'admin',
    ssl: ssl
});

var db = mongoose.connection;

db.on('error', function (err) {
    log.error('mongodb connection error: %e', err);
});

db.once('open', function () {
    log.debug('connected to mongodb');
    initializer.init(function (err) {
        if (err) {
            return log.error(err);
        }
        mongoose.disconnect(function () {
            log.info('successfully initialized');
        });
    });
});
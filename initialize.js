var log = require('logger')('initializer:initialize');
var nconf = require('nconf').argv().env();
var async = require('async');
var mongoose = require('mongoose');
var initializer = require('./index');

var env = nconf.get('env');

nconf.defaults(require('./env/' + env + '.json'));

var mongodbUri = nconf.get('mongodbUri');

mongoose.connect(mongodbUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    log.debug('connected to mongodb : ' + mongodbUri);
    initializer.init(function (err) {
        if (err) {
            return log.error(err);
        }
        log.info('successfully initialized');
    });
});
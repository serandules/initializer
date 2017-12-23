var log = require('logger')('initializers:initialize');
var nconf = require('nconf').argv().env();
var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
var initializer = require('./index');

mongoose.Promise = global.Promise;

var env = nconf.get('ENV');

nconf.defaults(require('./env/' + env + '.json'));

var certPath = nconf.get('CERT_SERANDIVES');
var pemPath = nconf.get('PEM_SERVER');
var mongourl = nconf.get('MONGODB_URI');

var ca = certPath ? fs.readFileSync(certPath) : null;
var pem = pemPath ? fs.readFileSync(pemPath) : null;

mongoose.connect(mongourl, {
    useMongoClient: true,
    authSource: 'admin',
    ssl: !!pem,
    sslCA: ca,
    sslCert: pem,
    sslKey: pem
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
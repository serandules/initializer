var log = require('logger')('initializers');
var nconf = require('nconf');
var async = require('async');
var mongoose = require('mongoose');
var fs = require('fs');

var utils = require('utils');
var Config = require('model-configs');

var env = utils.env();

exports.init = function (done) {
    Config.findOne({name: 'initializers'}).exec(function (err, config) {
        if (err) {
            return done(err);
        }
        var initializers = config ? JSON.parse(config.value) : [];
        var index = {};
        initializers.forEach(function (initializer) {
            index[initializer] = true;
        });
        fs.readdir(__dirname + '/serandives', function (err, paths) {
            if (err) {
                return done(err);
            }
            var run = [];
            paths.sort().forEach(function (path) {
                if (!index[path]) {
                    run.push(path);
                }
            });
            var ran = [];
            async.whilst(function () {
                return run.length;
            }, function (executed) {
                var path = run.shift();
                var initializer;
                try {
                    initializer = require('./serandives/' + path);
                } catch (e) {
                    return executed(e)
                }
                initializer(function (err) {
                    if (err) {
                        return executed(err);
                    }
                    ran.push(path);
                    executed();
                });
            }, function (err) {
                if (err) {
                    console.error(err)
                    log.error('error executing initializers: %e', err);
                }
                initializers = initializers.concat(ran);
                Config.update({name: 'initializers'}, {value: JSON.stringify(initializers)}, {upsert: true}, done);
            });
        });
    });
};
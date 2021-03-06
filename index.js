var log = require('logger')('initializers');
var _ = require('lodash');
var nconf = require('nconf');
var async = require('async');
var mongoose = require('mongoose');
var fs = require('fs');

var utils = require('utils');
var Config = utils.model('configs');

var env = utils.env();

var zeroPad = function (name, length) {
    return (Array(length + 1).join('0') + name).slice(-length);
};

var sort = function (index, paths) {
    var maxLength = 0
    paths.forEach(function (path) {
        var length = path.indexOf('-');
        maxLength = length > maxLength ? length : maxLength;
    });
    var names = {};
    _.map(paths, function (path) {
        var length = path.length + maxLength - path.indexOf('-');
        names[zeroPad(path, length)] = path;
    });
    var run = [];
    Object.keys(names).sort().forEach(function (name) {
        var path = names[name];
        if (!index[path]) {
            run.push(path);
        }
    });
    return run;
};

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
            var run = sort(index, paths);
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
                    return done(err);
                }
                initializers = initializers.concat(ran);
                Config.update({name: 'initializers'}, {value: JSON.stringify(initializers)}, {upsert: true}, done);
            });
        });
    });
};

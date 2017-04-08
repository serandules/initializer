var log = require('logger')('initializer');
var nconf = require('nconf');
var async = require('async');
var mongoose = require('mongoose');

var env = nconf.get('env');

var plugins = ['roles', 'users', 'clients', 'configs', 'vehicles'];

exports.init = function (done) {
    var tasks = [];
    plugins.forEach(function (plugin) {
        tasks.push(function () {
            var args = Array.prototype.slice.call(arguments);
            var done = args.pop();
            var ctx = args.pop() || {};
            log.info('plugin : %s', plugin);
            require('./serandives/' + plugin)(ctx, done);
        });
    });
    async.waterfall(tasks, done);
};
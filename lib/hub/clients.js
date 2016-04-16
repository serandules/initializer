var log = require('logger')('initializer:hub:clients');
var Client = hub('client');

var email = 'admin@serandives.com';

var name = 'serandives';

var create = function (ctx, done) {
    Client.findOne({
        name: name
    }).exec(function (err, client) {
        if (err) {
            return done(err);
        }
        if (client) {
            ctx.clients = {};
            ctx.clients[name] = client;
            return done(false, ctx);
        }
        var user = ctx.users[email];
        Client.create({
            name: name,
            user: user,
            has: {
                '*': {
                    '': ['*']
                }
            }
        }, function (err, client) {
            if (err) {
                return done(err);
            }
            log.info('clients created successfully');
            ctx.clients = {};
            ctx.clients[name] = client;
            done(false, ctx);
        });
    });
};

module.exports = function (ctx, done) {
    create(ctx, done);
};
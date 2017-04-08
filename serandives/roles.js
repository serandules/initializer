var log = require('logger')('initializer:serandives:roles');

var Role = require('role');

var name = 'admin';

var description = 'Role of serandives.com admins';

var create = function (ctx, done) {
    Role.findOne({
        name: name
    }).exec(function (err, role) {
        if (err) {
            return done(err);
        }
        if (role) {
            log.info('roles already exist');
            ctx.roles = {
                admin: role.id
            };
            return done(false, ctx);
        }
        Role.create({
            name: name,
            description: description,
            has: {
                '*': {
                    '': ['*']
                }
            }
        }, function (err, role) {
            if (err) {
                return done(err);
            }
            log.info('roles created successfully');
            ctx.roles = {
                admin: role.id
            };
            done(false, ctx);
        });
    });
};


module.exports = function (ctx, done) {
    create(ctx, done);
};
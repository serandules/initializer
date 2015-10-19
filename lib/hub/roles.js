var log = require('logger')('initializer:hub:roles');

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
            return done();
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
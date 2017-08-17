var log = require('logger')('initializers:serandives:roles');

var Role = require('model-roles');

var name = 'admin';

var description = 'Role of serandives.com admins';

module.exports = function (done) {
    Role.create({
        name: name,
        description: description
    }, function (err, role) {
        if (err) {
            return done(err);
        }
        log.info('roles created successfully');
        done();
    });
};
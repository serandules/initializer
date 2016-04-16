var log = require('logger')('initializer:hub:domains');
var async = require('async');
var Domain = hub('domain');

var email = 'admin@serandives.com';

var name = 'serandives';

var create = function (ctx, domain, done) {
    var name = domain.name;
    var repo = domain.repo;
    Domain.findOne({
        name: name
    }).exec(function (err, domain) {
        if (err) {
            return done(err);
        }
        if (domain) {
            ctx.domains = {};
            ctx.domains[name] = domain;
            return done(false, ctx);
        }
        Domain.create({
            name: name,
            repo: repo
        }, function (err, domain) {
            if (err) {
                return done(err);
            }
            ctx.domains = {};
            ctx.domains[name] = domain;
            done(false, ctx);
        })
    });
};

module.exports = function (ctx, done) {
    var domains = [];
    domains.push({
        name: '*.serandives.com',
        repo: 'https://github.com/serandules/balancer.git'
    });
    domains.push({
        name: '*.accounts.serandives.com',
        repo: 'https://github.com/serandules/accounts.git'
    });
    domains.push({
        name: 'accounts.serandives.com',
        repo: 'https://github.com/serandules/accounts-services.git'
    });
    domains.push({
        name: '*.autos.serandives.com',
        repo: 'https://github.com/serandules/autos.git'
    });
    domains.push({
        name: 'autos.serandives.com',
        repo: 'https://github.com/serandules/autos-services.git'
    });

    async.each(domains, function (domain, done) {
        create(ctx, domain, done);
    }, function (err) {
        done(err, ctx);
    })
};
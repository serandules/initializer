var log = require('logger')('initializers:serandives:menus');
var Configs = require('model-configs');
var Pages = require('model-pages');
var commons = require('../commons');

var async = require('async');
var fs = require('fs');
var path = require('path');

var pages = [
  {alias: '/about', title: 'About', body: 'about.html'},
  {alias: '/contact', title: 'Contact', body: 'contact.html'},
  {alias: '/help', title: 'Help', body: 'help.html'},
  {alias: '/privacy', title: 'Privacy', body: 'privacy.html'},
  {alias: '/terms', title: 'Terms', body: 'terms.html'}
]

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    async.eachSeries(pages, function (page, seriesDone) {
      fs.readFile(path.join(__dirname, '..', 'pages', page.body), function (err, data) {
        if (err) {
          return seriesDone(err);
        }
        Pages.create({
          user: o.user,
          title: page.title,
          body: data,
          workflow: o.workflow,
          status: 'published',
          permissions: o.permissions,
          visibility: o.visibility,
          _: {}
        }, function (err, p) {
          if (err) {
            return seriesDone(err);
          }
          Configs.findOne({
            user: o.user,
            name: 'aliases'
          }, function (err, o) {
            if (err) {
              return seriesDone(err);
            }
            var aliases = JSON.parse(o.value);
            aliases[page.alias] = p.id;
            Configs.update({_id: o._id}, {
              value: JSON.stringify(aliases)
            }, seriesDone);
          });
        });
      });
    }, function (err) {
      if (err) {
        return done(err);
      }
      log.info('pages:created');
      done();
    });
  });
};

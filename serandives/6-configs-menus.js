var log = require('logger')('initializers:serandives:menus');

var async = require('async');
var Configs = require('model-configs');

var commons = require('../commons');

var menus = [{
  name: 'www',
  value: [
    {url: '/about', title: 'About'},
    {url: '/contact', title: 'Contact'},
    {url: '/help', title: 'Help'}
  ]
}, {
  name: 'www-affiliates',
  value: [
    {url: 'autos://', title: 'Autos'},
    {url: 'realestates://', title: 'Real Estates'},
    {url: 'jobs://', title: 'Jobs'}
  ]
}, {
  name: 'user',
  value: [
    {url: '/profile', title: 'Profile'},
    {url: '/contacts', title: 'Contacts'},
    {url: '/locations', title: 'Locations'}
  ]
}, {
  name: 'admin',
  value: [
    {url: '/manage-locations', title: 'Locations'},
    {url: '/manage-contacts', title: 'Contacts'},
    {url: '/manage-vehicles', title: 'Vehicles'},
    {url: '/manage-pages', title: 'Pages'},
    {url: '/manage-configs', title: 'Configs'}
  ]
}, {
  name: 'accounts-affiliates',
  value: [
    {url: 'autos://', title: 'Autos'},
    {url: 'realestates://', title: 'Real Estates'},
    {url: 'jobs://', title: 'Jobs'}
  ]
}, {
  name: 'autos-affiliates',
  value: [
    {url: 'realestates://', title: 'Real Estates'},
    {url: 'jobs://', title: 'Jobs'}
  ]
}, {
  name: 'autos-primary',
  value: [
    {url: '/vehicles', title: 'Search'}
  ]
}, {
  name: 'autos-secondary',
  value: [
    {url: '/create-vehicles', title: 'Add'},
    {url: '/mine', title: 'My Vehicles'}
  ]
}, {
  name: 'realestates-affiliates',
  value: [
    {url: 'autos://', title: 'Autos'},
    {url: 'jobs://', title: 'Jobs'}
  ]
}, {
  name: 'jobs-affiliates',
  value: [
    {url: 'autos://', title: 'Autos'},
    {url: 'realestates://', title: 'Real Estates'}
  ]
}];

module.exports = function (done) {
  commons.meta(function (err, o) {
    if (err) {
      return done(err);
    }
    var visibility = o.visibility;
    visibility.name = {
      groups: [o.public._id, o.anonymous._id]
    };
    visibility.value = {
      groups: [o.public._id, o.anonymous._id]
    };
    var menuz = {};
    async.whilst(function () {
      return menus.length
    }, function (whilstDone) {
      var menu = menus.shift();
      Configs.create({
        user: o.user,
        name: 'menus-' + menu.name,
        value: JSON.stringify(menu.value),
        workflow: o.workflow,
        status: 'published',
        permissions: o.permissions,
        visibility: visibility,
        _: {}
      }, function (err, menu) {
        if (err) {
          return whilstDone(err);
        }
        menuz[menu.name] = menu.id;
        whilstDone();
      });
    }, function (err) {
      if (err) {
        return done(err);
      }
      Configs.create({
        user: o.user,
        name: 'menus',
        value: JSON.stringify(menuz),
        workflow: o.workflow,
        status: 'published',
        permissions: o.permissions,
        visibility: visibility,
        _: {}
      }, function (err) {
        if (err) {
          return done(err);
        }
        log.info('menus:created');
        done();
      });
    });
  });
};

var Q = require('Q');

console.log('SW-Started', self);

function notify(title, options) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        console.log('SW-NoPermission', self.Notification.permission);
        return Q(); 
    }

    if(self.registration.showNotification) {
        return self.registration.showNotification(title, options);
    }

    var notification = new Notification(title, options);
    return Q();
}

self.addEventListener('install', function(event) {
    self.skipWaiting();
    console.log('SW-Installed', event);
});

self.addEventListener('activate', function(event) {
    console.log('SW-Activated', event);
    self.clients.claim();
});

self.addEventListener('push', function(event) {
  console.log('Push message', event);

  var title = 'Push message';

  event.waitUntil(
    notify(title, {
      'body': 'The Message',
      'icon': 'images/icon.png'
    }));
});
require('../public/icon.png');

import i18next from 'i18next';
import resources from '../locales';

const Dexie = require('dexie');

i18next.init({
    interpolation: {
        escapeValue: false
    },
    lng: 'en',
    resources: resources
}, (err, t) => {
    if(err) {
        console.error('Unable to initialize i18n!', err);
    }
});

console.debug('SW-Started', self);

const db = new Dexie('GoalReminderDb');
db.version(1).stores({ data: 'id,company_id,email,code,goals' });

function notify(title, options) {
    if (!(self.Notification && self.Notification.permission === 'granted')) {
        console.info('SW-NoPermission', self.Notification.permission);
        return Promise.resolve(); 
    }

    if(self.registration.showNotification) {
        return self.registration.showNotification(title, options);
    }

    var notification = new Notification(title, options);
    return Promise.resolve();
}

self.addEventListener('message', function(event) {
    console.debug('SW-Message', event);
    const data = event.data;

    if(!data.employee) {
        console.info('SW-IgnoringMsgEvent', data);
        return;
    }

    event.waitUntil(
        // pre-load our local database with the initial goal data
        db.transaction('rw', db.data, function*() {
            yield db.data.clear();
            yield db.data.add({id: data.employee.employee_id, company_id: data.employee.company_id, email: data.employee.email, code: data.code, goals: data.employee.goals });
            console.debug('SW-SavedData', data);
        }).catch(e => {
            console.error('SW-UnableToSaveInitialData', e);
        })
    );
});

self.addEventListener('install', function(event) {
    self.skipWaiting();
    console.debug('SW-Installed', event);
});

self.addEventListener('activate', function(event) {
    console.debug('SW-Activated', event);
    self.clients.claim();

    event.waitUntil(
    notify(i18next.t('notifications.welcome.title'), {
      'body': i18next.t('notifications.welcome.message'),
      'icon': 'images/icon.png'
    }));
});

self.addEventListener('push', function(event) {
    // gcm notification received, so we must retrieve the goals and show the notific.
    console.debug('SW-GCM!', event, db, db.data);

    event.waitUntil(db.data.toArray().then(function(data) {
        data = data[0];

        var request = new Request('/api/v1/employees/poll', {
            method: 'POST', 
            body: JSON.stringify({ code: data.code })
        });
        request.headers.set('Content-Type', 'application/json');

        // fetch the updated data (goals)
        return fetch(request).then(function(response) {
            return response.json();
        }).then(function(goals) {
            data.goals = goals;
            return db.data.put(data).then(function() { return data.goals; });  
        }).catch(e => {
            console.error('SW-UnableToFetchGoals', e);
            return data.goals;
        });

    }).then(function(goals) {
        // show the goals notification
        for(var i=0; i < goals.length; i++) {
            goals[i] = '- ' + goals[i];
        }
        var msg = goals.join('\n');

        return notify(i18next.t('notifications.reminder.title'), {
            'body': i18next.t('notifications.reminder.message', { goal: msg }),
            'icon': 'images/icon.png'
        });
    }).catch(e => {
        console.error('SW-UnableToShowGoals', e);
    }));
});
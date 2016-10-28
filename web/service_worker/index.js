require('../public/icon.png');

import i18next from 'i18next';
import resources from '../locales';

const Dexie = require('dexie');

const DB_NAME = 'GoalReminderDb';
const DB_SCHEMA = { data: 'id,company_id,email,code,goals' };
const DB_VERSION = 1;

const MIN_NOTIFICATION_DELAY_MS = 45000;

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

let reminderIndex = -1;
let lastNotificationMs = 0;

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

    const db = new Dexie(DB_NAME);
    db.version(DB_VERSION).stores(DB_SCHEMA);

    const data = event.data;

    if(!data.employee) {
        console.info('SW-IgnoringMsgEvent', data);
        return;
    }

    event.waitUntil(
        // pre-load our local database with the initial goal data
        db.delete().then(function() {
            return db.open();
        }).then(function() {
            return db.data.put({id: data.employee.employee_id, company_id: data.employee.company_id, email: data.employee.email, code: data.code, goals: data.employee.goals.join('\n') });
        }).then(data => {
            db.close();

            console.debug('SW-SavedData', data); 
            event.ports[0].postMessage('Ok');

            return notify(i18next.t('notifications.welcome.title'), {
                'body': i18next.t('notifications.welcome.message'),
                'icon': 'images/icon.png',
                'tag': 'rt-welcome'
            });
        }, e => {
            db.close();

            console.error('SW-UnableToSaveInitialData', e);
            event.ports[0].postMessage({ error: e });
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
});

self.addEventListener('push', function(event) {
    
    // gcm notification received, so we must retrieve the goals and show the notific.
    console.debug('SW-GCM!', event);

    if (!(self.Notification && self.Notification.permission === 'granted')) {
        // return right away and don't poll the API so that we don't update last_notification_ts
        // we won't be able to show the notification
        console.info('SW-NoPermission', self.Notification.permission);
        return;
    }

    const db = new Dexie(DB_NAME);
    db.version(DB_VERSION).stores(DB_SCHEMA);

    event.waitUntil(db.open().then(function() {
        return db.data.toArray();
    }).then(function(data) {
        data = data[0];

        if(!data) {
            return [];
        }

        var request = new Request('/api/v1/employees/poll', {
            method: 'POST', 
            body: JSON.stringify({ code: data.code })
        });
        request.headers.set('Content-Type', 'application/json');

        // fetch the updated data (goals)
        return fetch(request).then(function(response) {
            return response.json();
        }).then(function(goals) {
            data.goals = goals.join('\n');
            return db.data.put(data).then(function() { return goals; });
        }).catch(e => {
            console.error('SW-UnableToFetchGoals', e);
            return data.goals ? data.goals.split('\n') : [];
        });

    }).then(function(goals) {
        db.close();

        // show the goals notification
        reminderIndex++;
        if(reminderIndex >= goals.length) {
            reminderIndex = 0;
        }

        if(goals.length <= 0 || !goals[reminderIndex]) {
            console.warn('No goals/reminders found!', goals);
            return;
        }

        const currentMs = new Date().getTime();
        if(currentMs - lastNotificationMs > MIN_NOTIFICATION_DELAY_MS) {
            // check for updates
            // if we trigger this without showing a notification
            // a default notification warning the user that something in the background
            // has just updated will pop up
            self.registration.update();

            lastNotificationMs = currentMs;
            return notify('', {
                'body': goals[reminderIndex],
                'icon': 'images/icon.png',
                'tag': 'rt-reminder'
            });
        }

        // this could happen when the person goes online and several notifications are pending
        console.debug('Received multiple GCM notifications in less than ' + (MIN_NOTIFICATION_DELAY_MS / 1000) + ' secs...', (currentMs - lastNotificationMs) / 1000);

    }).catch(e => {
        db.close();
        console.error('SW-UnableToShowGoals', e);
    }));
});
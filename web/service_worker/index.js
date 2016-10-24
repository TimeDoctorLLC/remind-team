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

let reminderIndex = -1;
let processingMessage = false;

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

    processingMessage = true;

    event.waitUntil(
        // pre-load our local database with the initial goal data
        db.data.clear().then(function() {
            return db.data.put({id: data.employee.employee_id, company_id: data.employee.company_id, email: data.employee.email, code: data.code, goals: data.employee.goals });
        }).catch(e => {
            console.error('SW-UnableToSaveInitialData', e);
            event.ports[0].postMessage({ error: e });
        }).then(data => {
            console.debug('SW-SavedData', data); 
            processingMessage = false; 
            
            event.ports[0].postMessage('Ok');

            return notify(i18next.t('notifications.welcome.title'), {
                'body': i18next.t('notifications.welcome.message'),
                'icon': 'images/icon.png'
            });
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
    console.debug('SW-GCM!', event, db, db.data);

    self.registration.update();

    if(processingMessage) {
        console.warn('SW-GCM: Processing message...');
        return;
    }

    event.waitUntil(db.data.toArray().then(function(data) {
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
            data.goals = goals;
            if(!processingMessage) {
                return db.data.put(data).then(function() { return data.goals; });
            }  
            return data.goals;
        }).catch(e => {
            console.error('SW-UnableToFetchGoals', e);
            return data.goals;
        });

    }).then(function(goals) {
        // show the goals notification
        reminderIndex++;
        if(reminderIndex >= goals.length) {
            reminderIndex = 0;
        }

        if(goals.length <= 0 || !goals[reminderIndex]) {
            console.warn('No goals/reminders found!', goals);
            return;
        }

        return notify('', {
            'body': goals[reminderIndex],
            'icon': 'images/icon.png'
        });
    }).catch(e => {
        console.error('SW-UnableToShowGoals', e);
    }));
});
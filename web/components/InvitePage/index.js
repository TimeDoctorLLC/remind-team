import './styles.scss'
import React from 'react'
import superagent from 'superagent'
import _ from '../utils'

const render = (ctx) => (
  <div className="invite-page">
    <h1>You've been invited to Goal Reminder!</h1>
    <p className="lead">Goal Reminder frequently sends you notifications with all the goals established for you.</p>
    <p><strong>To accept the invitation, please allow the request for notifications.</strong> This won't be necessary if you have already done it before.</p>

    <div className="alert-panel">
  {
    ctx.status === 'denied' ?
      (<div className="alert alert-warning">Notifications for Goal Reminder are blocked. The invitation won't be accepted if notifications are not allowed.</div>) :
    (ctx.status === 'asked' ? 
      (<div className="alert alert-info">Please allow notifications in order to continue.</div>) :
    (ctx.status === 'yes' ?
      (<div className="alert alert-info">Enabling notifications...</div>) :
    (ctx.status === 'done' ? 
      (<div className="alert alert-success">You're all set! Thank You!</div>) :
      (<div className="alert alert-danger">Oops! There was an error while confiming the invitation.<br/>{ctx.status}</div>)
    )))
  }
    </div>
  </div>
)

const initServiceWorker = (t) => {
  let reg;

  const subscribe = () => {
      return reg.pushManager.subscribe({userVisibleOnly: true});
  };

  const unsubscribe = (sub) => {
      return sub.unsubscribe();
  };

  t.props.startLoading();

  // register the service worker
  return window.navigator.serviceWorker.register('/sw.js').then(function() {
      return navigator.serviceWorker.ready;
  }).then(function(serviceReg) {
      console.debug('Invite-ServiceWorkerRegistration', serviceReg);
      reg = serviceReg;
      // subscribe the worker to GCM notifications
      return subscribe().then(unsubscribe).then(subscribe);
  }).then(function(sub) {
      console.debug('Invite-GcmSubscription', sub);
      // send the GCM registration id to the server and accept the invite
      return superagent.post((process.env.API_ROOT || '') + '/api/v1/companies/invite').type('json').send({ 
        code: t.props.params.code, 
        gcm_id: sub.endpoint.substring(sub.endpoint.lastIndexOf('/') + 1) 
      }).set('Accept', 'application/json');
  }).then(function(res) {
      console.debug('Invite-ServerResponse', res);
      // send the initial goal data to the worker
      return reg.active.postMessage({
        code: t.props.params.code,
        employee: res.body
      });
  }).then(function() {
      console.debug('Invite-Done');
      t.setState({ status: 'done' });
      t.props.stopLoading();
  }).catch(function(error) {
      t.setState({ status: error.toString() });
      console.error('Service Worker Error :^(', error);
      t.props.stopLoading();
  });  
};

function isSupported() {
  return window.Notification && 'serviceWorker' in window.navigator;
}

export default _.present(render, {
  setInitialState: function() {
    return {
      status: window.Notification && window.Notification.permission === 'granted' ? 'yes' : 'asked'
    };
  },
  componentDidMount: function() {
    if (isSupported()) {
      if(window.Notification.permission !== "granted") {
        window.Notification.requestPermission().then((result) => {
          if (result === 'denied' || result === 'default') {
            this.setState({ status: 'denied' });
            return;
          }
          this.setState({ status: 'yes' });
          initServiceWorker(this);
        });
      } else {
        this.setState({ status: 'yes' });
        initServiceWorker(this);
      }
    }
  }
})

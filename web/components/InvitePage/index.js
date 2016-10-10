import './styles.scss'
import React from 'react'
import _ from '../utils'

const render = (ctx) => (
  <div className="invite-page">
  {
    ctx.status === 'denied' ?
      "The invitation won't be accepted if notifications are not allowed." :
    (ctx.status === 'asked' ? 
      "Please allow desktop notifications in order to continue." :
    (ctx.status === 'yes' ?
      "Enabling notifications..." :
    (ctx.status === 'done' ? 
      "Thank You!" :
      "Error: " + ctx.status
    )))
  }
  </div>
)

const initServiceWorker = (t) => {
  let reg;
  console.log(t);

  const subscribe = () => {
      return reg.pushManager.subscribe({userVisibleOnly: true});
  };

  const unsubscribe = (sub) => {
      return sub.unsubscribe();
  };

  return window.navigator.serviceWorker.register('/sw.js').then(function() {
      return navigator.serviceWorker.ready;
  }).then(function(serviceReg) {
      reg = serviceReg;
      return subscribe().then(unsubscribe).then(subscribe);
  }).then(function(sub) {
      return $.ajax((process.env.API_ROOT || '') + '/api/v1/companies/invite', { 
        type: 'POST',
        contentType : 'application/json',
        data: JSON.stringify({ code: t.props.params.code, gcm_id: sub.endpoint.substring(40) })
      });
  }).then(function() {
      t.setState({ status: 'done' });
  }).catch(function(error) {
      t.setState({ status: error });
      console.log('Service Worker Error :^(', error);
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

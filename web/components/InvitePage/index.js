import './styles.scss'
import React from 'react'
import superagent from 'superagent'
import _ from '../utils'

// http://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome/13348618#13348618
function isChrome() {
  // please note, 
  // that IE11 now returns undefined again for window.chrome
  // and new Opera 30 outputs true for window.chrome
  // and new IE Edge outputs to true now for window.chrome
  // and if not iOS Chrome check
  // so use the below updated condition
  var isChromium = window.chrome,
      winNav = window.navigator,
      vendorName = winNav.vendor,
      isOpera = winNav.userAgent.indexOf("OPR") > -1,
      isIEedge = winNav.userAgent.indexOf("Edge") > -1,
      isIOSChrome = winNav.userAgent.match("CriOS");

  if(isIOSChrome){
    // is Google Chrome on IOS
    return true;
  } else if(isChromium !== null && isChromium !== undefined && vendorName === "Google Inc." && isOpera == false && isIEedge == false) {
    // is Google Chrome
    return true;
  }

  // not Google Chrome 
  return false;
}

const isChromeCheck = isChrome();

const render = (ctx, t) => (
  <div className="invite-page">
    <h1>{t('invites.youHaveBeenInvited')}</h1>
  { isChromeCheck ? (    
    <div>
    <p className="lead">{t('invites.frequentlySendsYou')}</p>
    <p>{t('invites.toAcceptTheInvitation')}</p>

    <div className="alert-panel">
  {
    ctx.status === 'denied' ?
      (<div className="alert alert-warning">{t('invites.notificationsBlocked')}</div>) :
    (ctx.status === 'asked' ? 
      (<div className="alert alert-info">{t('invites.pleaseAllowNotifications')}</div>) :
    (ctx.status === 'yes' ?
      (<div className="alert alert-info">{t('invites.enablingNotifications')}</div>) :
    (ctx.status === 'done' ? 
      (<div className="alert alert-success">{t('invites.youAreAllSet')}</div>) :
      (<div className="alert alert-danger">{t('invites.errorConfirmingInvitation')}<br/>{ctx.status}</div>)
    )))
  }
    </div>
    </div>
  ) : (
    <p className="lead">{t('invites.notChrome')}</p>
  ) }
  </div>
)

const sendMessage = (ctrl, code, employee) => {
  return new Promise(function(resolve, reject) {
      // create a message channel
      // we'll wait for the service worker to respond
      var msgChannel = new MessageChannel();
      msgChannel.port1.onmessage = function(event) {
          if(event.data.error) {
              reject(event.data.error);
          } else {
              resolve(event.data);
          }
      };

      // send message to service worker along with port for reply
      ctrl.postMessage({
        code,
        employee
      }, [msgChannel.port2]);
  }); 
};

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
      return sendMessage(reg.active, res.body.at, res.body.employee);
  }).then(function() {
      console.debug('Invite-Done');
      t.setState({ status: 'done' });
      t.props.stopLoading();
  }).catch(function(error) {
      t.setState({ status: error.toString() });
      console.error('Service Worker Error', error);
      t.props.stopLoading();
  });  
};

function isSupported() {
  return window.Notification && 'serviceWorker' in window.navigator;
}

export default _.present(render, {
  getInitialState: function() {
    return {
      status: window.Notification && window.Notification.permission === 'granted' ? 'yes' : 'asked'
    };
  },
  componentDidMount: function() {
    if (isChromeCheck && isSupported()) {
      if(window.Notification.permission !== "granted") {
        this.props.startLoading();
        window.Notification.requestPermission().then((result) => {
          if (result === 'denied' || result === 'default') {
            this.props.stopLoading();
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

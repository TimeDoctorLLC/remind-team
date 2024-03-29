require('./public/index.html')
require('./public/manifest.json')

import _ from 'underscore'

import React from 'react'
import { render } from 'react-dom'
import { Router, Route, IndexRoute, Link } from 'react-router'
import { Provider, connect } from 'react-redux'

import storeCreator from './store'
import App from './components/App/controller'
import IndexPage from './components/IndexPage/controller'
import SignUpPage from './components/SignUpPage/controller'
import InvitePage from './components/InvitePage/controller'
import ErrorPage from './components/ErrorPage/controller'

import I18nextProvider from './components/i18n'

import actions from './actions'

const initialState = { 
  token: localStorage.getItem('token'), 
  company: JSON.parse(localStorage.getItem('company'))
}

const storeAndHistory = storeCreator(initialState)

const Root = React.createClass({
  render: function() {
    return (<I18nextProvider><App {...this.props} /></I18nextProvider>);
  },
});

render(
  <Provider store={storeAndHistory.store}>
    <Router history={storeAndHistory.history}>
      <Route path="/" component={Root}>
        <IndexRoute component={IndexPage} />
        <Route path="signup" component={SignUpPage} />
        <Route path="invite/:code" component={InvitePage} />
        <Route path="e/:code" component={ErrorPage} />
        <Route path="*" component={ErrorPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)

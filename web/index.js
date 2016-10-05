require('./public/index.html')
require('./public/template.csv')

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

const initialState = { 
  token: localStorage.getItem('token'), 
  company: JSON.parse(localStorage.getItem('company'))
}

const storeAndHistory = storeCreator(initialState)

render(
  <Provider store={storeAndHistory.store}>
    <Router history={storeAndHistory.history}>
      <Route path="/" component={App}>
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

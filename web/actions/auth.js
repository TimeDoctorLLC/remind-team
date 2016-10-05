import superagent from 'superagent'
import { registerAlert, clearAlert, registerLoadingOperation, clearLoadingOperation, registerApiOk } from './api'
import { push } from 'react-router-redux'

export const LOGIN_KEY = 'api_login'

/*
 * {String} email
 * {String} password
 */
export function login(email, password) {
  return function(dispatch, getState) {
    dispatch(registerLoadingOperation(LOGIN_KEY, {email, password}))

    superagent
      .post((process.env.API_ROOT || '') + '/api/v1/auth')
      .auth(email, password)
      .end(function(err, res) {
        dispatch(err ? registerAlert(LOGIN_KEY, "error", {err, res}) : registerApiOk(LOGIN_KEY, [{persist: true, state_key: 'token', body: res.body.at}, {persist: true, state_key: 'company', body: res.body.company}]))
      })
  }
}

export function clearLoginAlert() {
  return clearAlert(LOGIN_KEY)
}


export const REGISTER_KEY = 'api_register'

/*
 * {String} name
 * {String} email
 * {String} password
 */
export function register(name, email, password) {
  return function(dispatch, getState) {
    dispatch(registerLoadingOperation(REGISTER_KEY, {name, email, password}))

    superagent
      .post((process.env.API_ROOT || '') + '/api/v1/companies')
      .send({ user_name: name, user_email: email, user_password: password })
      .end(function(err, res) {
        dispatch(err ? registerAlert(REGISTER_KEY, "error", {err, res}) : registerApiOk(REGISTER_KEY, [{persist: true, state_key: 'token', body: res.body.at}, {persist: true, state_key: 'company', body: res.body.company}]))
        if(!err) {
          dispatch(push('/'));
        }
      })
  }
}

export function clearRegisterAlert() {
  return clearAlert(REGISTER_KEY)
}


export function logout() {
  return {
    type: 'PB_LOGOUT'
  }
}

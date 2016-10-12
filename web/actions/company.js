import superagent from 'superagent'
import { registerAlert, clearAlert, registerLoadingOperation, clearLoadingOperation, registerApiOk } from './api'
import { logout } from './auth'

export const GET_COMPANY_KEY = 'api_get_company'

export function getCompany(id) {
  return function(dispatch, getState) {
    const {main} = getState()

    dispatch(registerLoadingOperation(GET_COMPANY_KEY, { ts: Date.now() }))

    superagent
      .get((process.env.API_ROOT || '') + '/api/v1/companies/' + id + '?_=' + new Date().getTime())
      .set('Authorization', 'Bearer ' + main.token)
      .end(function(err, res) {
        if(err && (err.status == 403 || err.status == 401)) {
          dispatch(logout())
        }
        dispatch(err ? registerAlert(GET_COMPANY_KEY, "error", {err, res}) : registerApiOk(GET_COMPANY_KEY, {persist: true, state_key: 'company', body: res.body}))
      })
  }
}

export function clearGetCompanyAlert() {
  return clearAlert(GET_COMPANY_KEY)
}


export const SAVE_COMPANY_KEY = 'api_save_company'

export function saveCompany(company) {
  return function(dispatch, getState) {
    const {main} = getState()

    dispatch(registerLoadingOperation(SAVE_COMPANY_KEY, company))

    superagent
      .post((process.env.API_ROOT || '') + '/api/v1/companies/' + company.company_id + '?_=' + new Date().getTime())
      .set('Authorization', 'Bearer ' + main.token)
      .send(company)
      .end(function(err, res) {
        if(err && (err.status == 403 || err.status == 401)) {
          dispatch(logout())
        }
        if(err) {
          dispatch(registerAlert(SAVE_COMPANY_KEY, "error", {err, res}))
        } else {
          dispatch(registerAlert(SAVE_COMPANY_KEY, "msg", "Company data saved!"))
          dispatch(registerApiOk(SAVE_COMPANY_KEY, [{persist: true, state_key: 'token', body: res.body.at}, {persist: true, state_key: 'company', body: res.body.company}]))
        }
      })
  }
}

export function clearSaveCompanyAlert() {
  return clearAlert(SAVE_COMPANY_KEY)
}
import superagent from 'superagent'
import { registerAlert, clearAlert, registerLoadingOperation, clearLoadingOperation, registerApiOk } from './api'

export const ACCEPT_INVITE_KEY = 'api_accept_invite'

export function acceptInvite(code, gcmId) {
  return function(dispatch, getState) {
    const {main} = getState()

    dispatch(registerLoadingOperation(ACCEPT_INVITE_KEY, {code, gcmId}))

    superagent
      .post((process.env.API_ROOT || '') + '/api/v1/companies/invite?_=' + new Date().getTime())
      .send({ code: code, gcm_id: gcmId })
      .end(function(err, res) {
        if(err) {
          dispatch(registerAlert(ACCEPT_INVITE_KEY, "error", {err, res}))
        } else {
          dispatch(registerAlert(ACCEPT_INVITE_KEY, "msg", "Invite accepted! Welcome to Goal Reminder!"));
          dispatch(registerApiOk(ACCEPT_INVITE_KEY, {state_key: 'invite_accepted', body: true}))
        }
      })
  }
}

export function clearAcceptInviteAlert() {
  return clearAlert(ACCEPT_INVITE_KEY)
}
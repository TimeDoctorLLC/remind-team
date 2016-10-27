import superagent from 'superagent'
import { registerAlert, clearAlert, registerLoadingOperation, clearLoadingOperation, registerApiOk } from './api'
import { logout } from './auth'

export const RESEND_INVITE_EMPLOYEE_KEY = 'api_resend_invite_employee'

export function resendInvite(employeeId) {
  return function(dispatch, getState) {
    const {main} = getState();

    dispatch(registerLoadingOperation(RESEND_INVITE_EMPLOYEE_KEY, employeeId));

    superagent
      .post((process.env.API_ROOT || '') + '/api/v1/employees/' + employeeId + '/remind?_=' + new Date().getTime())
      .set('Authorization', 'Bearer ' + main.token)
      .end(function(err, res) {
        if(err && (err.status == 403 || err.status == 401)) {
          dispatch(logout());
        }
        if(err) {
          if(err.status == 409) {
            // must wait
            dispatch(registerAlert(RESEND_INVITE_EMPLOYEE_KEY, "error", 'api.employeeResendMustWait'));
            return;
          }
          dispatch(registerAlert(RESEND_INVITE_EMPLOYEE_KEY, "error", {err, res}));
          return;
        } 

        dispatch(registerAlert(RESEND_INVITE_EMPLOYEE_KEY, "msg", 'api.employeeResendSuccess'));
        dispatch(registerApiOk(RESEND_INVITE_EMPLOYEE_KEY, []));
      });
  };
}

export function clearResendInviteAlert() {
  return clearAlert(RESEND_INVITE_EMPLOYEE_KEY)
}
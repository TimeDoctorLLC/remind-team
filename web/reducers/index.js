import _ from 'underscore'

import { registerLoadingOperation, clearLoadingOperation, registerAlert, clearAlert, registerApiOk } from './api'
import { logout } from './auth'

export default {
    '@@redux/INIT': _.identity,

    PB_REGISTER_LOADING_OPERATION: registerLoadingOperation,
    PB_CLEAR_LOADING_OPERATION: clearLoadingOperation,

    PB_REGISTER_ALERT: registerAlert,
    PB_CLEAR_ALERT: clearAlert,

    PB_REGISTER_API_OK: registerApiOk,

    PB_LOGOUT: logout
}
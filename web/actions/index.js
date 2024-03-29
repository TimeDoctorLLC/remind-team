import { registerAlert, clearAlert, registerLoadingOperation, clearLoadingOperation } from './api'
import { login, logout, register, clearLoginAlert, clearRegisterAlert } from './auth'
import { getCompany, saveCompany, clearGetCompanyAlert, clearSaveCompanyAlert } from './company'
import { acceptInvite, clearAcceptInviteAlert } from './invite'
import { resendInvite, clearResendInviteAlert } from './employee'

export default {
    registerAlert, clearAlert, registerLoadingOperation, clearLoadingOperation,
    login, logout, register,
    clearLoginAlert, clearRegisterAlert,
    getCompany, saveCompany, clearGetCompanyAlert, clearSaveCompanyAlert,
    acceptInvite, clearAcceptInviteAlert,
    resendInvite, clearResendInviteAlert
}
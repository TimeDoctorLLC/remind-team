import {connect} from 'react-redux'
import IndexPage from './'

import actions from '../../actions'

const mapStateToProps = (state) => {
    return {
        company: state.main.company
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSignIn: function(email, password) {
      dispatch(actions.login(email, password))
    },
    registerAlert: function(key, type, alert) {
      dispatch(actions.registerAlert(key, type, alert))
    },
    clearAlert: function(key) {
      dispatch(actions.clearAlert(key))
    },
    save: function(company) {
      dispatch(actions.saveCompany(company))
    },
    refresh: function(companyId) {
      dispatch(actions.getCompany(companyId))
    },
    resendInvite: function(employeeId) {
      dispatch(actions.resendInvite(employeeId))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(IndexPage)

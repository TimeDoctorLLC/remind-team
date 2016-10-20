import {connect} from 'react-redux'
import InvitePage from './'

import actions from '../../actions'

const mapStateToProps = (state) => {
    return {
        invite_accepted: state.main.invite_accepted
    }
}

const mapDispatchToProps = (dispatch) => ({
    accept: function(code, gcmId) {
      dispatch(actions.acceptInvite(code, gcmId))
    },
    startLoading: function() {
        dispatch(actions.registerLoadingOperation('INVITE_LOADING', { op: 'setup-gcm' }));
    },
    stopLoading: function() {
        dispatch(actions.clearLoadingOperation('INVITE_LOADING'));
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(InvitePage)

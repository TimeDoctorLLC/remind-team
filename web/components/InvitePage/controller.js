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
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(InvitePage)

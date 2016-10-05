import {connect} from 'react-redux'
import SignUpPage from './'

import actions from '../../actions'

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch) => ({
    onSignUp: function(name, email, password) {
      dispatch(actions.register(name, email, password))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(SignUpPage)

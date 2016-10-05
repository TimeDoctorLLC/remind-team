import {connect} from 'react-redux'
import ContactInsert from './'

import actions from '../../actions'

const mapStateToProps = (state) => {
    return {
        user: state.main.user
    }
}

const mapDispatchToProps = (dispatch) => ({
    onInsert: function(contact) {
      dispatch(actions.addContact(contact))
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(ContactInsert)

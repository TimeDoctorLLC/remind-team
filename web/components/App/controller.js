import {connect} from 'react-redux'
import _ from 'underscore'
import App from './'

import actions from '../../actions'

const getStringOf = (el) => {
    if(!_.isObject(el)) {
        return el
    }
    return String(el)
}

const mapStateToProps = (state) => {
    return {
        company: state.main.company,
        loading: _.reduce(state.main.ops, function(count, el) { return count + (el ? 1 : 0) }, 0) > 0,
        errors: _.reduce(state.main.alerts, function(arr, el) {
            if(el && el.type == "error") {
                arr.push(el.alert.err ? getStringOf(el.alert.err) : getStringOf(el.alert))
            }
            return arr
        }, []),
        msgs: _.reduce(state.main.alerts, function(arr, el) {
            if(el && el.type != "error") {
                arr.push(getStringOf(el.alert))
            }
            return arr
        }, [])
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSignOut: function() {
      dispatch(actions.logout())
    },
    onDismissError: function() {
      dispatch(actions.clearAlert())
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(App)

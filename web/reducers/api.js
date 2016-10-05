import _ from 'underscore'

/*
 * {Object} state
 * {Object} action
 * {String} action.type - "PB_REGISTER_LOADING_OPERATION"
 * {String} action.key
 * action.* (extras)
 */
export function registerLoadingOperation(state, action) {
  const obj_ops = {}
  obj_ops[action.key] = action.op
  const ops = Object.assign({}, state.ops || {}, obj_ops)

  const obj_alerts = {}
  obj_alerts[action.key] = null
  const alerts = Object.assign({}, state.alerts || {}, obj_alerts)

  return Object.assign({}, state, { ops, alerts })
}

/*
 * {Object} state
 * {Object} action
 * {String} action.type - "PB_CLEAR_LOADING_OPERATION"
 * {String} action.key
 */
export function clearLoadingOperation(state, action) {
  const obj = {}
  obj[action.key] = null
  const ops = Object.assign({}, state.ops || {}, obj)
  return Object.assign({}, state, { ops })
}


/*
 * {Object} state
 * {Object} action
 * {String} action.type - "PB_REGISTER_ALERT"
 * {String} action.key
 * {String} action.alert
 * {String} action.alert_type - "error" or "msg"
 * action.* (extras)
 */
export function registerAlert(state, action) {
  const obj_alerts = {}
  obj_alerts[action.key] = { alert: action.alert, type: action.alert_type }
  const alerts = Object.assign({}, state.alerts || {}, obj_alerts)

  const obj_ops = {}
  obj_ops[action.key] = null
  const ops = Object.assign({}, state.ops || {}, obj_ops)

  return Object.assign({}, state, { alerts, ops })
}

/*
 * {Object} state
 * {Object} action
 * {String} action.type - "PB_CLEAR_ALERT"
 * {String} action.key
 */
export function clearAlert(state, action) {
  if(action.key) {
    const obj = {}
    obj[action.key] = null
    const alerts = Object.assign({}, state.alerts || {}, obj)
    return Object.assign({}, state, { alerts })
  }
  return Object.assign({}, state, { alerts: {} })
}


/*
 * {Object} state
 * {Object} action
 * {String} action.type - "PB_REGISTER_API_OK"
 * {String} action.key
 * {Object} action.data
 */
export function registerApiOk(state, action) {
  let ops = action.data
  if(!_.isArray(ops)) {
    ops = [ops]
  }

  const obj = {}

  _.each(ops, function(op) {
    if(!op.state_key) { return }

    const oldData = obj[op.state_key] || state[op.state_key]
    let newData = {}
    
    if(op.in_arr) {
      newData = oldData ? [...oldData] : []
      newData.push(op.body)
      if(_.isFunction(op.in_arr)) {
        newData = _.sortBy(newData, op.in_arr)
      }
    } else if(op.out_arr) {
      if(oldData) {
        newData = _.filter(oldData, function(el) {
          return el[op.out_arr] != op.body[op.out_arr]
        })
      }
    } else if(op.replace_arr) {
      newData = _.map(oldData, function(el) {
        if(el[op.replace_arr] == op.body[op.replace_arr]) {
          return op.body
        }
        return el
      })
    } else if(op.map) {
      newData = _.reduce(op.body, function(arr, el) {
        arr[el[op.map]] = el
        return arr
      }, {})
    } else {
      newData = op.body
    }
    
    obj[op.state_key] = newData
    if(op.persist) {
      localStorage.setItem(op.state_key, _.isArray(newData) || _.isObject(newData) ? JSON.stringify(newData) : newData)
    }
  })

  const obj_ops = {}
  obj_ops[action.key] = null
  ops = Object.assign({}, state.ops || {}, obj_ops)

  return Object.assign({}, state, obj, { ops })
}
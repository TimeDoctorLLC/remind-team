export function registerLoadingOperation(key, op) {
  return {
    type: 'PB_REGISTER_LOADING_OPERATION',
    key: key,
    op: op
  }
}

export function clearLoadingOperation(key) {
  return {
    type: 'PB_CLEAR_LOADING_OPERATION',
    key: key
  }
}

export function registerAlert(key, type, alert) {
  return {
    type: 'PB_REGISTER_ALERT',
    key: key,
    alert_type: type,
    alert: alert
  }
}

export function clearAlert(key) {
  return {
    type: 'PB_CLEAR_ALERT',
    key: key
  }
}

export function registerApiOk(key, data) {
  return {
    type: 'PB_REGISTER_API_OK',
    key: key,
    data: data
  }
}
/*
 * {Object} state - see type definition in store.js
 * {Object} action
 * {String} action.type - "PB_LOGOUT"
 */
export function logout(state, action) {
  localStorage.clear()
  return Object.assign({}, state, {token: null, company: null})
}
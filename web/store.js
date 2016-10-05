import {createStore, applyMiddleware, combineReducers} from 'redux'
import thunk from 'redux-thunk'
import {browserHistory} from 'react-router'
import {syncHistoryWithStore, routerReducer, routerMiddleware} from 'react-router-redux'

import reducers from './reducers'

const reducer = (state = {}, action) => {
  const newState = reducers[action.type] ? reducers[action.type](state, action) : state
  return newState
}

export default (initialState, noHistory) => {
    
    const store = createStore(combineReducers({
        main: reducer, 
        routing: routerReducer
    }), {
        main: initialState, 
        routing: {}
    }, applyMiddleware(thunk, routerMiddleware(browserHistory)))
    
    const history = noHistory ? null : syncHistoryWithStore(browserHistory, store)

    return {
        history: history,
        store: store
    }
}

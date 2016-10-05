import './styles.scss'
import React from 'react'
import _ from '../utils'
import __ from 'underscore'

import Index from '../Index'
import Dashboard from '../Dashboard'

const render = (ctx) => {
  return ctx.company ? (
    <Dashboard company={ctx.company} onSave={ctx.onSave} registerAlert={ctx.registerAlert} clearAlert={ctx.clearAlert} />
  ) : (
    <Index onSignIn={ctx.onSignIn} onSignUp={ctx.onSignUp} />
  )
}

export default _.present(render)

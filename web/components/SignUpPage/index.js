import './styles.scss'
import React from 'react'
import _ from '../utils'
import __ from 'underscore'

import SignUp from '../SignUp'

const render = (ctx) => (
  <div className="index">
      <h1>Goal Reminder App</h1>
      <p className="lead">Easily remind your company team members of their goals.</p>
      <SignUp onSignUp={ctx.onSignUp} />
    </div>
)

export default _.present(render)

import './styles.scss'
import React from 'react'
import _ from '../utils'

import SignIn from '../SignIn'
import SignUp from '../SignUp'

const render = (ctx) => {
  return (
    <div className="index">
      <h1>Goal Reminder App</h1>
      <p className="lead">Easily remind your company team members of their goals.</p>
      <SignIn onSignIn={ctx.onSignIn} />
    </div>
  )
}

export default _.present(render)

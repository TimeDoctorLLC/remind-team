import './styles.scss'
import React from 'react'
import _ from '../utils'

import SignIn from '../SignIn'
import SignUp from '../SignUp'

const render = (ctx, t) => {
  return (
    <div className="index">
      <h1>{t('globals.appNameApp')}</h1>
      <p className="lead">{t('globals.appDescription')}</p>
      <SignIn onSignIn={ctx.onSignIn} />
    </div>
  )
}

export default _.present(render)

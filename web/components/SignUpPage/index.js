import './styles.scss'
import React from 'react'
import _ from '../utils'
import __ from 'underscore'

import SignUp from '../SignUp'

const render = (ctx, t) => (
  <div className="index">
      <h1>{t('globals.appNameApp')}</h1>
      <p className="lead">{t('globals.appDescription')}</p>
      <SignUp onSignUp={ctx.onSignUp} />
    </div>
)

export default _.present(render)

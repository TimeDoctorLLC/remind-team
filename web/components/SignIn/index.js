import './styles.scss'
import React from 'react'
import { Link } from 'react-router'
import _ from '../utils'

const render = (ctx, t) => (
  <div className="sign-in">
  <form onSubmit={ctx.signIn}>
    <div className="form-group">
      <input className="email form-control" type="email" placeholder={t('enroll.email')} onChange={ctx.setEmail} />
    </div>
    <div className="form-group">
      <input className="password form-control" type="password" placeholder={t('enroll.password')} onChange={ctx.setPassword} />
    </div>
    <button className="submit" type="submit" className="btn btn-success">{t('globals.signIn')}</button>
    <span className="signup pull-right"> {t('globals.or')} <Link to="/signup">{t('globals.signUp')}</Link></span>
  </form>
  </div>
)

export default _.present(render, {
  email: null, password: null,
  setEmail: function(e) {
    this.email = e.target.value
  },
  setPassword: function(e) {
    this.password = e.target.value
  },
  signIn: function(e) {
    e.preventDefault()
    this.props.onSignIn(this.email, this.password)
  }
})

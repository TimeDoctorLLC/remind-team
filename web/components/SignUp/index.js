import './styles.scss'
import React from 'react'
import { Link } from 'react-router'
import _ from '../utils'

const render = (ctx) => (
  <div className="sign-up">
  <form onSubmit={ctx.signUp}>
    <div className="form-group">
      <input className="name form-control" type="text" placeholder="Name" onChange={ctx.setName} />
    </div>
    <div className="form-group">
      <input className="email form-control" type="email" placeholder="Email" onChange={ctx.setEmail} />
    </div>
    <div className="form-group">
      <input className="password form-control" type="password" placeholder="Password" onChange={ctx.setPassword} />
    </div>
    <button className="submit" type="button" className="btn btn-success btn-register" onClick={ctx.signUp}>Sign Up</button>
    <span className="signin pull-right"> or <Link to="/">Sign In</Link></span>
  </form>
  </div>
)

export default _.present(render, {
  name: null, email: null, password: null,
  setName: function(e) {
    this.name = e.target.value
  },
  setEmail: function(e) {
    this.email = e.target.value
  },
  setPassword: function(e) {
    this.password = e.target.value
  },
  signUp: function(e) {
    e.preventDefault()
    this.props.onSignUp(this.name, this.email, this.password)
  }
})

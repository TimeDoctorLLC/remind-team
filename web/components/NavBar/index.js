import './styles.scss'
import '../../../node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js'
import React from 'react'
import { Link } from 'react-router'
import _ from '../utils'

import Loading from '../Loading'

const render = (ctx) => {
  return (
    <div className="navbar-container">
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container">
      
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar-collapse-1" aria-expanded="false" aria-controls="navbar">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="/">Goal Reminder</a>
        </div>

        <div className="collapse navbar-collapse" id="navbar-collapse-1">
          <ul className="nav navbar-nav navbar-right">
            <li><a href="#" onClick={ctx.signOut}>Sign Out</a></li>
          </ul>
        </div>
      </div>     
    </nav>

    { ctx.showProgress ? (<Loading />) : null }
    </div>
  )
}

export default _.present(render, {
  signOut: function(e) {
    e.preventDefault()
    this.props.onSignOut()
  }
})

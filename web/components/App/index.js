import './styles.scss'
import React from 'react'
import _ from '../utils'

import SignIn from '../SignIn'
import NavBar from '../NavBar'
import Loading from '../Loading'

const render = (ctx) => {
    let alertError = null
    let alertMsg = null

    if(ctx.errors.length > 0) {
        alertError = (
            <div>
                <div className="alert alert-danger">
                    {ctx.errors.map(function(err, i) {
                        return (
                            <div key={i} className="error">{err}</div>
                        )
                    })}
                </div>
            </div>
        )
    }

    if(ctx.msgs.length > 0) {
        alertMsg = (
            <div>
                <div className="alert alert-success">
                    {ctx.msgs.map(function(msg, i) {
                        return (
                            <div key={i} className="msg">{msg}</div>
                        )
                    })}
                </div>
            </div>
        )
    }

    const dismissLink = alertError || alertMsg ? (<a href="#" className="dismiss" onClick={ctx.dismiss}>Dismiss</a>) : null

    return (
        <div id="root">
            {ctx.company ? (
                <NavBar active={ctx.location.pathname == "/" ? 1 : 2} username={ctx.company.user_name} onSignOut={ctx.onSignOut} showProgress={ctx.loading} />
            ) : ctx.loading ? (<Loading />) : null }
            { alertError }
            { alertMsg }
            { dismissLink }
            { ctx.props.children }
        </div>
    )
}

export default _.present(render, {
    dismiss: function(e) {
        e.preventDefault()
        this.props.onDismissError()
    }
})
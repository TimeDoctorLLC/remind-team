import './styles.scss'
import React from 'react'
import _ from '../utils'

const errors = {
    404: {
        code: 404,
        title: 'Oops! 404, page not found.', 
        message: 'Sorry about that, but the page you are looking for is not available anymore. \nFortunately, you can go back to:'
    },
    401: {
        code: 401,
        title: 'Resource requires authorized access.', 
        message: 'Your authentication might have expired or be invalid.\nIf you think something is broken, report a problem.' 
    },
    500: {
        code: 500, 
        title: 'Looks like we\'re having \nsome server issues.', 
        message: 'Go back to the previous page and try again.\nIf you think something is broken, report a problem.' 
    }
}

const render = (ctx) => {
    if(!ctx.code || !errors[ctx.code]) {
        ctx.code = 404
    }

    return (
        <div id="errorBody" className="container">
            <div>
                <section className="first">
                    <div className="row first">

                    <div className="col-xs-12 col-md-12">
                        <a className="header-logo pull-left" href="/">
                            <img src="/images/header-logo.png" alt="" />
                        </a>
                        <ul className="header-buttons">
                            <li>
                                <a href="#" className="how-it-works">
                                    How it works
                                </a>
                            </li>
                            <li>
                                <a href={"https://slack.com/oauth/authorize?scope=identity.basic&client_id=" + ctx.slackClientId}>
                                    <img alt="Sign in with Slack" height="40" width="168" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                                </a>
                            </li>
                            <li>
                                <a href={"https://slack.com/oauth/authorize?scope=commands,bot,groups:write,channels:write,channels:read,groups:read,users:read&client_id=" + ctx.slackClientId}>
                                    <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="col-xs-12 col-md-12 content">
                        <h1 className="text-danger">{errors[ctx.code].title}</h1>
                        <p className="lead">{errors[ctx.code].message}</p>

                        <div className="row">
                            <div className="col-md-12">
                                <a className="btn btn-primary back-button" href="/">Go Home</a>
                            </div>
                        </div>

                        <img width="690" height="363" src="/images/section-one-feature-img.png" alt="" className="feature-img btn img-responsive"/>
                    </div>

                    </div>
                </section>

                
            </div>
        </div>
    )
}

export default _.present(render)

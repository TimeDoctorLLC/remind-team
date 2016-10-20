import './styles.scss'
import React from 'react'
import { Link } from 'react-router'
import _ from '../utils'

const render = (ctx, t) => {
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
    };

    if(!ctx.code) {
        ctx.code = 500
    }

    const title = t('errors.' + ctx.code + '.title');
    const msg = t('errors.' + ctx.code + '.message');

    return (
        <div id="errorBody" className="container">
            <div>
                <section className="first">
                    <div className="row first">

                    <div className="col-xs-12 col-md-12 content">
                        <h1 className="text-danger">{title}</h1>
                        <p className="lead">{msg}</p>

                        <div className="row">
                            <div className="col-md-12">
                                <Link className="btn btn-primary back-button" to="/">{t('goHome')}</Link>
                            </div>
                        </div>

                    </div>

                    </div>
                </section>

                
            </div>
        </div>
    )
}

export default _.present(render)

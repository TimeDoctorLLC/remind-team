import './styles.scss'
import React from 'react'
import _ from '../utils'

const render = (ctx) => {
  return (
    <div className="progress">
        <div className="indeterminate"></div>
    </div>
  )
}

export default _.present(render)

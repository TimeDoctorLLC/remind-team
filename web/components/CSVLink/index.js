import './styles.scss'
import React from 'react'
import _ from '../utils'
import __ from 'underscore'

const render = (ctx) => {
  const csv = encodeURIComponent(__.map(ctx.data, function(row) { return row.join(',') }).join('\n'))
  const href = 'data:text/csv;charset=utf-8,' + csv
  return (
    <a href={href} download={'goalreminder_' + (new Date()).getTime() + '.csv'}>{ctx.children}</a>
  )
}

export default _.present(render)

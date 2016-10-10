import './styles.scss'
import React from 'react'
import _ from '../utils'
import __ from 'underscore'

const render = (ctx) => (
  <a href="" className={ctx.className} onClick={ctx.onLink}>{ctx.children}</a>
);

export default _.present(render, {
  onLink: function(e) {
    e.preventDefault();
    const downloadParam = 'goalreminder_' + (new Date()).getTime() + '.csv';
    const data = __.isFunction(this.props.data) ? this.props.data() : this.props.data;
    const csv = encodeURIComponent(__.map(data, function(row) { return row.join(',') }).join('\n'));
    const hrefParam = 'data:text/csv;charset=utf-8,' + csv;
    $('<a/>').attr('href', hrefParam).attr('download', downloadParam)[0].click();
  }
})

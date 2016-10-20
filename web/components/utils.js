import React from 'react'

const present = (render, others) => (
  React.createClass(Object.assign({
    contextTypes: {
      i18n: React.PropTypes.object,
      t: React.PropTypes.func
    },
    render: function() {
      // this.state overwrites this.props if key is in both
      return render(Object.assign({}, this.props, this.state, this.props.routeParams, this), this.context.t)
    },
  }, others))
)

export default {
  present
}

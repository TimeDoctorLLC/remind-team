import React from 'react'

const present = (render, others) => (
  React.createClass(Object.assign({
    render: function() {
      //this.state overwrites this.props if key is in both
      return render(Object.assign({}, this.props, this.state, this.props.routeParams, this))
    },
  }, others))
)

export default {
  present
}

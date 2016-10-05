import './styles.scss'
import React from 'react'
import _ from '../utils'

const render = (ctx) => (
  <div className="contact-insert">
  <h2>New Contact</h2>
  <div className="well">
    <form onSubmit={ctx.insert} className="form-horizontal">

      <div className="contact-name form-group">
        <label htmlFor="name" className="col-sm-2 control-label">Name</label>
        <div className="col-sm-10">
          <input id="name" className="form-control" type="text" placeholder="Name" onChange={ctx.set('name')} />
        </div>
      </div>

      <div className="contact-address form-group">
        <label htmlFor="address" className="col-sm-2 control-label">Address</label>
        <div className="col-sm-10">
          <textarea id="address" className="form-control" type="text" placeholder="Address" onChange={ctx.set('address')} />
        </div>
      </div>

      <div className="contact-phone contact-phone1 form-group">
        <label htmlFor="phone1" className="col-sm-2 control-label">Phone 1</label>
        <div className="col-sm-10">
          <input id="phone1" className="form-control" type="text" placeholder="Phone 1" onChange={ctx.set('phone1')} />
        </div>
      </div>

      <div className="contact-phone contact-phone2 form-group">
        <label htmlFor="phone2" className="col-sm-2 control-label">Phone 2</label>
        <div className="col-sm-10">
          <input id="phone2" className="form-control" type="text" placeholder="Phone 2" onChange={ctx.set('phone2')} />
        </div>
      </div>

      <div className="contact-phone contact-phone3 form-group">
        <label htmlFor="phone3" className="col-sm-2 control-label">Phone 3</label>
        <div className="col-sm-10">
          <input id="phone3" className="form-control" type="text" placeholder="Phone 3" onChange={ctx.set('phone3')} />
        </div>
      </div>

      <div className="contact-notes form-group">
        <label htmlFor="notes" className="col-sm-2 control-label">Notes</label>
        <div className="col-sm-10">
          <textarea id="notes" className="form-control" type="text" placeholder="Notes" onChange={ctx.set('notes')} />
        </div>
      </div>

      <button type="submit" className="btn btn-success pull-right"><span className="glyphicon glyphicon-plus" aria-hidden="true"></span> Add Contact</button>
      <div className="clearfix" />
    </form>
  </div>
  </div>
)

export default _.present(render, {
  name: null, address: null, phone1: null, phone2: null, phone3: null, notes: null,
  set: function(key) {
    return (e) => {
      this[key] = e.target.value
    }
  },
  insert: function(e) {
    e.preventDefault()
    this.props.onInsert({ 
      name: this.name, 
      address: this.address, 
      phone1: this.phone1, 
      phone2: this.phone2, 
      phone3: this.phone3, 
      notes: this.notes 
    })
  }
})

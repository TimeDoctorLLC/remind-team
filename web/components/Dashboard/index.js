import './styles.scss'
import React from 'react'
import _ from '../utils'
import __ from 'underscore'
import papa from 'papaparse'
import Q from 'q'

import CSVLink from '../CSVLink'

function getCSVFromFile(file) {
  var deferred = Q.defer();

  papa.parse(file, {
    complete: function(results, file) {
      if(results.errors.length > 0) {
        deferred.reject(results.errors)
      } else {
        deferred.resolve(results.data)
      }
    },
    error: function(error, file) {
      deferred.reject([error])
    }
  });

  return deferred.promise;
}

const render = (ctx) => {
  console.log(ctx)
  if(ctx.employeesOrder.length > 0) {
    return (
      <div className="dashboard">
        <p>You currently have {ctx.company.employees ? ctx.company.employees.length : 0} active team members.</p>
        <p><a href="#">Download CSV</a></p>
        <p><a href="#">Upload CSV</a></p>

        <hr />
        
        <div className="goal-interval-group form-group">
          <label htmlFor="goal-interval" className="control-label">Goal Reminder Interval</label>
          <div>
            <select id="goal-interval" className="form-control">
              <option value="60">1 min.</option>
            </select>
          </div>
        </div>

        <hr />

        <table className="table table-striped">
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Invitation Link</th>
          </tr>
        </thead>
        <tbody>
          {
            __.map(ctx.employeesOrder, function(employeeEmail) {
              const employee = ctx.employeesByEmail[employeeEmail];
              return (
                <tr key={employee.email}>
                  <td>{employee.email}</td>
                  <td>{employee.invite_sent ? 'Invite not sent!' : (employee.invite_accepted ? 'Done!' : 'Awaiting registration')}</td>
                  <td><a href="#">Link</a></td>
                </tr>
              )
            })
          }
        </tbody>
        </table>

        <div><a href="#">Save</a></div>
      </div>
    )
  }

  const csvTemplate = [
    ['email', 'goal1', 'goal2', 'goal3', 'goal4', 'goal5', 'do not remove this header row'],
    ['someone@replace.me', 'this is just an example goal', 'other goals are optional']
  ]

  return (
    <div className="dashboard">
      <p className="lead">To get started download this template CSV and use it to add all of your team members, their email and their top 1-5 goals. You can enter a maximum of five goals per person but one goal is also ok.</p>
      <p>
        <CSVLink data={csvTemplate}>Download CSV</CSVLink>
      </p>
      <p><input id="upload-csv-input" type="file" name="csv" accept=".csv" ref="csvFile" onChange={ctx.onUploadCsvChange} /> <a href="#" onClick={ctx.onUploadCsv}>Upload CSV</a></p>
    </div>
  )
}

export default _.present(render, {
  csvFile: null,
  getInitialState: function() {
    return {
      employeesOrder: __.map(this.props.company.employees, function(employee) {
        return employee.email.toLowerCase().trim()
      }),
      employeesByEmail: __.reduce(this.props.company.employees, function(obj, employee) {
        obj[employee.email.toLowerCase().trim()] = employee
        return obj;
      }, {})
    };
  },
  onUploadCsv: function() {
    $('.dashboard #upload-csv-input').click();
  },
  onUploadCsvChange: function(e) {
    if(!e.target.files[0]) {
      return;
    }

    this.props.clearAlert('CSV_ERROR')

    const t = this

    getCSVFromFile(e.target.files[0]).then(function(data) {
      console.log("Parsing complete:", data);

      const newEmployeesOrder = []
      const newEmployeesByEmail = {}

      __.each(__.rest(data), function(row) {
        const email = row[0].toLowerCase().trim()
        newEmployeesOrder.push(email)
        if(t.state.employeesByEmail[email]) {
          newEmployeesByEmail[email] = Object.assign({}, t.state.employeesByEmail[email], { goals: __.rest(row) }) 
        } else {
          newEmployeesByEmail[email] = { email, goals: __.rest(row), invite_sent: false, invite_accepted: false }
        }
      })

      t.setState({
        employeesOrder: newEmployeesOrder,
        employeesByEmail: newEmployeesByEmail
      })
    }, function(errors) {
      // ERR HERE
      console.log("Parsing error:", errors);
      t.props.registerAlert('CSV_ERROR', 'error', errors)
    }).done();
  }
})

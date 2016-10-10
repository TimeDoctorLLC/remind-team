import './styles.scss';
import React from 'react';
import _ from '../utils';
import __ from 'underscore';
import papa from 'papaparse';
import Q from 'q';

import CSVLink from '../CSVLink';

function getCSVFromFile(file) {
  var deferred = Q.defer();

  papa.parse(file, {
    complete: function(results, file) {
      if(results.errors.length > 0) {
        deferred.reject(results.errors);
      } else {
        deferred.resolve(results.data);
      }
    },
    error: function(error, file) {
      deferred.reject([error]);
    }
  });

  return deferred.promise;
}

const MINUTE = 60;
const HOUR = 3600;
const intervals = [{ label: '1 min', value: 60 }].concat(__.map(__.range(1, 25), function(i) {
  const secs = MINUTE * i * 60;
  const hours = Math.trunc(secs / HOUR);
  const mins = Math.trunc((secs % HOUR) / MINUTE);
  
  return {
    label: (hours ? hours + ' hour' + (hours > 1 ? 's' : '') : '') + ' ' + (mins ? mins + ' min' + (mins > 1 ? 's' : '') : ''),
    value: secs
  };
}));

const csvTemplate = [
  ['email', 'goal1', 'goal2', 'goal3', 'goal4', 'goal5', 'do not remove this header row'],
  ['someone@replace.me', 'this is just an example goal', 'other goals are optional']
];

const render = (ctx) => {
  
  if(ctx.company.employees.length > 0 || ctx.employeesOrder.length > 0) {
    return (
      <div className="dashboard">
        <p className="lead">You currently have {ctx.company.employees ? ctx.company.employees.length : 0} active team members</p>
        <p>
          <CSVLink className="btn btn-info" data={ctx.getCsv}>Download CSV</CSVLink> 
          <input id="upload-csv-input" type="file" name="csv" accept=".csv" ref="csvFile" onChange={ctx.onUploadCsvChange} /> <a className="btn btn-info" href="#" onClick={ctx.onUploadCsv}>Upload CSV</a>
        </p>

        <hr />
        
        <div className="goal-interval-group form-group">
          <label htmlFor="goal-interval" className="control-label">Goal Reminder Interval</label>
          <div>
            <select id="goal-interval" className="form-control" ref="notification_interval" defaultValue={ctx.company.notification_interval}>
              {intervals.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
        </div>

        <hr />

        {
          ctx.employeesOrder.length > 0 ?
          (
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
                      <td>{employee.invite_sent ? 'Invite not sent!' : (employee.invite_accepted ? 'Done!' : 'Waiting registration')}</td>
                      <td>{employee.invite_link ? (<a href={employee.invite_link}>Link</a>) : (<span className="not-saved">Not saved!</span>)}</td>
                    </tr>
                  )
                })
              }
            </tbody>
            </table>
          ) 
          :
          (
            <p className="empty"><strong>No team members!</strong><br />Saving will cause Goal Reminder to stop sending notifications for all of the previously registered team members.</p>
          )
        }

        <div><a className="btn btn-success" onClick={ctx.onSave}>Save</a></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <p className="lead">To get started <strong>download this template CSV</strong> and use it to <strong>add all of your team members</strong>, their email and their top 1-5 goals. You can enter a maximum of five goals per person but one goal is also ok.</p>
      <p>
        <CSVLink className="btn btn-info" data={csvTemplate}>Download CSV</CSVLink> 
        <input id="upload-csv-input" type="file" name="csv" accept=".csv" ref="csvFile" onChange={ctx.onUploadCsvChange} /> <a className="btn btn-info" href="#" onClick={ctx.onUploadCsv}>Upload CSV</a>
      </p>
    </div>
  )
};

export default _.present(render, {
  csvFile: null,
  getInitialState: function() {
    this.props.refresh(this.props.company.company_id);

    console.log('InitialState Company', this.props.company);
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

    this.props.clearAlert('CSV_ERROR');

    const t = this;

    getCSVFromFile(e.target.files[0]).then(function(data) {
      console.log("Parsing complete:", data);

      const newEmployeesOrder = [];
      const newEmployeesByEmail = {};

      __.each(__.rest(data), function(row) {
        const email = row[0].toLowerCase().trim();
        newEmployeesOrder.push(email);
        if(t.state.employeesByEmail[email]) {
          newEmployeesByEmail[email] = Object.assign({}, t.state.employeesByEmail[email], { goals: __.rest(row) }); 
        } else {
          newEmployeesByEmail[email] = { email, goals: __.rest(row), invite_sent: false, invite_accepted: false };
        }
      });

      t.setState({
        employeesOrder: newEmployeesOrder,
        employeesByEmail: newEmployeesByEmail
      });
    }, function(errors) {
      // ERR HERE
      console.log("Parsing error:", errors);
      t.props.registerAlert('CSV_ERROR', 'error', errors);
    }).done();
  },
  onSave: function(e) {
    e.preventDefault();

    console.log(this.state.employeesOrder, this.state.employeesByEmail, this.props.company);
    
    const newCompany = __.extend({}, this.props.company, {
      notification_interval: parseInt(this.refs.notification_interval.value, 10),
      employees: __.map(this.state.employeesOrder, (email) => {
        return this.state.employeesByEmail[email];
      })
    });

    console.log(newCompany);

    this.props.save(newCompany);
  },
  getCsv: function() {
    return [csvTemplate[0]].concat(__.map(this.state.employeesOrder, (email) => {
        var e = this.state.employeesByEmail[email];
        return [e.email].concat(e.goals);
    }));
  }
});

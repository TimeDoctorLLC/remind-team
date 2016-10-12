import './styles.scss';
import React from 'react';
import _ from '../utils';
import __ from 'underscore';
import papa from 'papaparse';
import Q from 'q';

import CSVLink from '../CSVLink';

function copyToClipboard(text) {

	  // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var origSelectionStart, origSelectionEnd;
    
    // must use a temporary form element for the selection and copy
    var target = document.getElementById(targetId);
    if (!target) {
        target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.id = targetId;
        document.body.appendChild(target);
    }
    target.textContent = text;

    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    
    // copy the selection
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    
    // clear temporary content
    target.textContent = "";

    return succeed;
}

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
                      <td>{employee.invite_sent ? (employee.invite_accepted ? (<span className="label label-success">Done!</span>) : (<span className="label label-info">Waiting Registration</span>)) : (<span className="label label-warning">Invite Not Sent</span>)}</td>
                      <td>{employee.invite_code ? (<a onClick={ctx.onLinkCopy} href={'/invite/' + employee.invite_code} className="invite-link">Copy </a>) : (<span className="not-saved label label-warning">Not Saved</span>)}</td>
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

        <div>
          <div className="pull-left"><a className="btn btn-success" onClick={ctx.onSave}>Save</a></div>
          <div className="pull-right"><a className="btn btn-default" onClick={ctx.onRefresh}><span className="glyphicon glyphicon-refresh" aria-hidden="true"></span> Refresh</a></div>
        </div>
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

function initState(props) {
    console.debug('initState', props);
    return {
      employeesOrder: __.map(props.company.employees, function(employee) {
        return employee.email.toLowerCase().trim()
      }),
      employeesByEmail: __.reduce(props.company.employees, function(obj, employee) {
        obj[employee.email.toLowerCase().trim()] = employee
        return obj;
      }, {})
    };
}

export default _.present(render, {
  refreshInterval: null,
  getInitialState: function() {
    // for the first time
    return initState(this.props);
  },
  componentWillReceiveProps: function(nextProps) {
    // for every subsequent times it gets new props
    this.setState(initState(nextProps));
  },
  componentDidMount: function() {
    // always refresh on load and set up a timer
    this.props.refresh(this.props.company.company_id);
    this.refreshInterval = setInterval(() => {
      this.props.refresh(this.props.company.company_id);
    }, 900000); // 15 mins.
  },
  componentWillUnmount: function() {
    // remove the refresh timer
    if(this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  onRefresh: function() {
    this.props.refresh(this.props.company.company_id);
  },
  onUploadCsv: function() {
    // click the hidden file input elem
    $('.dashboard #upload-csv-input').click();
  },
  onUploadCsvChange: function(e) {
    if(!e.target.files[0]) {
      return;
    }

    this.props.clearAlert('CSV_ERROR');

    const t = this;

    getCSVFromFile(e.target.files[0]).then(function(data) {
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
      console.error("Parsing error:", errors);
      t.props.registerAlert('CSV_ERROR', 'error', errors);
    }).done();
  },
  onSave: function(e) {
    e.preventDefault();
    
    const newCompany = __.extend({}, this.props.company, {
      notification_interval: parseInt(this.refs.notification_interval.value, 10),
      employees: __.map(this.state.employeesOrder, (email) => {
        return this.state.employeesByEmail[email];
      })
    });

    this.props.save(newCompany);
  },
  getCsv: function() {
    return [csvTemplate[0]].concat(__.map(this.state.employeesOrder, (email) => {
        var e = this.state.employeesByEmail[email];
        return [e.email].concat(e.goals);
    }));
  },
  onLinkCopy: function(e) {
    e.preventDefault();
    this.props.clearAlert('CLIPBOARD');
    if(copyToClipboard($(e).prop('href'))) {
      this.props.registerAlert('CLIPBOARD', 'msg', 'Invite link copied to clipboard!');
    } else {
      this.props.registerAlert('CLIPBOARD', 'error', 'Unable to copy to clipboard!');
    }
  }
});

import './styles.scss';
import React from 'react';
import _ from '../utils';
import __ from 'underscore';
import papa from 'papaparse';
import Q from 'q';
import moment from 'moment';

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
    skipEmptyLines: true,
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

let csvTemplate = null;

const render = (ctx, t) => {
  csvTemplate = [
    [t('csv.email'), t('csv.goal', { index: 1 }), t('csv.goal', { index: 2 }), t('csv.goal', { index: 3 }), t('csv.goal', { index: 4 }), t('csv.goal', { index: 5 }), t('csv.youCanAddMore'), , , , t('csv.doNotRemoveHeader')],
    [ctx.company.user_email, t('csv.exGoal1'), t('csv.exGoal2')]
  ];
  
  if(ctx.company.employees.length > 0 || ctx.employeesOrder.length > 0) {
    return (
      <div className="dashboard">
        <p className="lead">{t('dashboard.youCurrentlyHaveMembers', { count: ctx.company.employees ? ctx.company.employees.length : 0 })}</p>
        <form id="upload-csv-form">
          <CSVLink className="btn btn-info" data={ctx.getCsv}>{t('dashboard.downloadCsv')}</CSVLink> 
          <input id="upload-csv-input" type="file" name="csv" accept=".csv" ref="csvFile" onChange={ctx.onUploadCsvChange} /> <a className="btn btn-info" href="#" onClick={ctx.onUploadCsv}>{t('dashboard.uploadCsv')}</a>
        </form>

        <hr />
        
        <div className="goal-interval-group form-group">
          <label htmlFor="goal-interval" className="control-label">{t('dashboard.reminderInterval')}</label>
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
                <th>{t('dashboard.email')}</th>
                <th>{t('dashboard.status')}</th>
                <th>{t('dashboard.timeSinceLastReminder')}</th>
                <th>{t('dashboard.invitationLink')}</th>
              </tr>
            </thead>
            <tbody>
              {
                __.map(ctx.employeesOrder, function(employeeEmail) {
                  const warningTimeHtml = (<span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>);
                  const employee = ctx.employeesByEmail[employeeEmail];
                  const minsSinceLastReminder = moment.duration(moment.utc().diff(moment.utc(employee.last_notification_ts))).asMinutes();
                  let friendlyDuration = employee.last_notification_ts ? moment.duration(minsSinceLastReminder, 'minutes').humanize() : t('dashboard.noRemindersYet');
                  friendlyDuration = friendlyDuration.charAt(0).toUpperCase() + friendlyDuration.slice(1);
                  const showWarning = !employee.last_notification_ts || minsSinceLastReminder > 10080  /* more than 7 days */
                  return (
                    <tr key={employee.email}>
                      <td>{employee.email}</td>
                      <td>{employee.invite_sent ? (employee.invite_accepted ? (<span className="label label-success">{t('dashboard.statusDone')}</span>) : (<span className="label label-info">{t('dashboard.statusWaiting')}</span>)) : (<span className="label label-warning">{t('dashboard.statusInviteNotSent')}</span>)}</td>
                      <td className={showWarning ? 'text-red' : null}>{showWarning ? warningTimeHtml : null} {friendlyDuration}</td>
                      <td>{employee.invite_code ? (<a onClick={ctx.onLinkCopy} href={'/invite/' + employee.invite_code} className="invite-link">{t('dashboard.copy')} </a>) : (<span className="not-saved label label-warning">{t('dashboard.notSaved')}</span>)}</td>
                    </tr>
                  )
                })
              }
            </tbody>
            </table>
          ) 
          :
          (
            <p className="empty">{t('dashboard.noTeamMembers')}</p>
          )
        }

        <div>
          <div className="pull-left"><a className="btn btn-success" onClick={ctx.onSave}>{t('dashboard.save')}</a></div>
          <div className="pull-right"><a className="btn btn-default" onClick={ctx.onRefresh}><span className="glyphicon glyphicon-refresh" aria-hidden="true"></span> {t('dashboard.refresh')}</a></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <p className="lead">{t('dashboard.toGetStarted')}</p>
      <form id="upload-csv-form">
        <CSVLink className="btn btn-info" data={csvTemplate}>{t('dashboard.downloadCsv')}</CSVLink> 
        <input id="upload-csv-input" type="file" name="csv" accept=".csv" ref="csvFile" onChange={ctx.onUploadCsvChange} /> <a className="btn btn-info" href="#" onClick={ctx.onUploadCsv}>{t('dashboard.uploadCsv')}</a>
      </form>
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

        if(!email) {
          throw t.context.i18n.t('dashboard.csvErrorEmptyLine');
        }

        // filter out empty goals
        const goals = __.filter(__.rest(row), function(goal) { return goal.trim(); });

        if(goals.length <= 0 || !goals.join('').trim()) {
          throw t.context.i18n.t('dashboard.csvErrorNoGoals', { email });
        }

        newEmployeesOrder.push(email);
        if(t.state.employeesByEmail[email]) {
          newEmployeesByEmail[email] = Object.assign({}, t.state.employeesByEmail[email], { goals: goals }); 
        } else {
          newEmployeesByEmail[email] = { email, goals: goals, invite_sent: false, invite_accepted: false };
        }
      });

      t.setState({
        employeesOrder: newEmployeesOrder,
        employeesByEmail: newEmployeesByEmail
      });
    }).fail(function(errors) {
      console.error("Parsing error:", errors);
      t.props.registerAlert('CSV_ERROR', 'error', errors);
    }).done();

    $('#upload-csv-form').trigger('reset');
    //$(e).unwrap();
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
      this.props.registerAlert('CLIPBOARD', 'msg', this.context.i18n.t('dashboard.inviteLinkCopied'));
    } else {
      this.props.registerAlert('CLIPBOARD', 'error', this.context.i18n.t('dashboard.unableToCopy'));
    }
  }
});

import React, { Component } from 'react';
import moment from 'moment';
import ApprovalQueueDay from './ApprovalQueueDay';
import { Menu, Message } from 'semantic-ui-react';
// import { inject, observer } from 'mobx-react';

class ApprovalQueue extends Component {
  
  getShiftTotalMinutes(shift) {
    let minutes = moment(shift.finish.timestamp.toDate()).diff(moment(shift.start.timestamp.toDate()), 'minutes');
    if (shift.unpaidMinutes) minutes -= shift.unpaidMinutes;
    return minutes;
  }

  convertMinutesToHoursAndMinutes(minutes) {
    let hours = Math.floor(minutes / 60);
    let remainingMinutes = minutes - (hours * 60);
    if (remainingMinutes.toString().length < 2) remainingMinutes = 0 + remainingMinutes.toString();  
    return hours + ':' + remainingMinutes;
  }

  render() { 
    const { user } = this.props;
    const shifts = this.props.approvalQueue;
    const loading = this.props.loadingApprovalQueue;
    function datestamps() {
      let datestamps = [];
      shifts.forEach(shift => {
        const datestamp = moment(shift.start.timestamp.toDate()).format('YYYY-MM-DD');
        if (datestamps.indexOf(datestamp) < 0) {
          datestamps.push(datestamp);
        }
      });
      return datestamps.sort((a,b) => a > b);
    }
    function filterShifts(datestamp) {
      return shifts.filter(shift => moment(shift.start.timestamp.toDate()).format('YYYY-MM-DD') === datestamp);
    }
    return (
      <div>
        {/* <Loader active={loading} content='Loading approval queue' /> */}
        <Menu secondary>
          <Menu.Item header>Approval Queue</Menu.Item>
          {/* <Menu.Item position='right' onClick={this.loadData}><Icon name='refresh' /> Reload</Menu.Item> */}
        </Menu>
        {!loading && !shifts.length &&
          <Message positive>
            <Message.Header>Congratulations!</Message.Header>
            <p>
              The approval queue is empty
            </p>
          </Message>
        }
        {datestamps().map(datestamp => (
          <ApprovalQueueDay 
            key={datestamp} 
            date={moment(datestamp).toDate()}
            shifts={filterShifts(datestamp)} 
            isApprovalQueue={true}
            user={user}
          />
        ))}
      </div>
    )
  }
}
 
// export default inject('store')(observer(ApprovalQueue));
export default ApprovalQueue;
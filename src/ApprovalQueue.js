import React, { Component } from 'react';
import moment from 'moment';
import ApprovalQueueDay from './ApprovalQueueDay';
import { Menu, Loader } from 'semantic-ui-react';

class ApprovalQueue extends Component {
  state = {
    shifts: [],
    checkedShifts: []
  }

  componentDidMount() {
    console.log('ApprovalQueue did mount');
    this.setState({ loading: true });
    this.props.db.collection('shifts').where('isApproved', '==', false).get().then(snapshot => {
      const shifts = [];
      snapshot.docs.forEach(doc => {
        shifts.push({ ...doc.data(), id: doc.id });
      });
      this.setState({ shifts, loading: false });
    });
  }

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

  updateShift = (shift, data) => {
    let target = this.props.shifts.find(s => s.id === shift.id);
    this.props.updateShift(target, data);
  }
  
  render() { 
    const { loading, shifts } = this.state;
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
        <Loader active={loading} content='Loading approval queue' />
        <Menu secondary>
          <Menu.Item header>Approval Queue</Menu.Item>
        </Menu>
        {datestamps().map(datestamp => (
          <ApprovalQueueDay key={datestamp} date={moment(datestamp).toDate()} shifts={filterShifts(datestamp)} />
        ))}
      </div>
    )
  }
}
 
export default ApprovalQueue;
import React, { Component } from 'react';
import moment from 'moment';
import DayOfShifts from './ApprovalQueueDay';

class ShiftsByDay extends Component {
  state = {  }
  render() { 
    const { shifts } = this.props;
    function getDatestamps() {
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
        {getDatestamps().map(datestamp => (
          <DayOfShifts key={datestamp} date={moment(datestamp).toDate()} shifts={filterShifts(datestamp)} />
        ))}
      </div>
    );
  }
}
 
export default ShiftsByDay;
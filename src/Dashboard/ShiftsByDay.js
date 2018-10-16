import React, { Component } from 'react';
import moment from 'moment';
import ApprovalQueueDay from './ApprovalQueueDay';
import { Message } from 'semantic-ui-react';
import { observer } from 'mobx-react';

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
    if (shifts.length < 1) return <Message info content='Nothing to show here.' />
    return (
      <div>
        {getDatestamps().map(datestamp => (
          <ApprovalQueueDay 
            key={datestamp} 
            date={moment(datestamp).toDate()} 
            shifts={filterShifts(datestamp)} 
            isApprovedShifts={true} 
            onReload={this.props.onReload}
            readonly={this.props.readonly}
            user={this.props.user}
          />
        ))}
      </div>
    );
  }
}
 
export default observer(ShiftsByDay);
import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';
import ApprovalQueueShift from './ApprovalQueueShift';
import { totalMinutes, getUnpaidMinutes } from '../shift-time-functions';
import { minutesToHoursAndMinutes } from '../date-functions';

class ApprovalQueueEmployee extends Component {
  state = {  }
  totalShifts = () => {
    let minutes = 0;
    this.props.shifts.forEach(shift => {
      minutes += (totalMinutes(shift) - getUnpaidMinutes(shift))
    });
    return minutes;
  }
  render() { 
    const { employee, shifts } = this.props;
    return (
      <React.Fragment>
        {shifts.map((shift, index) => (
          <ApprovalQueueShift key={shift.id} isApprovedShifts={this.props.isApprovedShifts} user={this.props.user} db={this.props.db} employee={employee} shift={shift} isFirst={index === 0} toggleChecked={this.props.toggleChecked} />
        ))}
        {shifts.length > 1 &&
          <Table.Row active>
            <Table.Cell colSpan={4} />
            <Table.Cell>{minutesToHoursAndMinutes(this.totalShifts())}</Table.Cell>
            <Table.Cell colSpan={2} />
          </Table.Row>
        }
      </React.Fragment>
    );
  }
}
 
export default ApprovalQueueEmployee;
import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';
import { totalMinutes, getUnpaidMinutes } from './shift-time-functions';

class WeeklyReport extends Component {
  state = {  }
  render() { 
    const { shifts } = this.props;
    console.log(shifts);
    function getShiftsByEmployee() {
      let shiftsByEmployee = {};
      shifts.forEach(shift => {
        const employeeId = shift.employee.id;
        if (!shiftsByEmployee[employeeId]) shiftsByEmployee[employeeId] = { employee: shift.employee, days: {}, totalMinutes: 0 }
        const day = moment(shift.start.timestamp.toDate()).day();
        if (!shiftsByEmployee[employeeId].days[day]) shiftsByEmployee[employeeId].days[day] = { shifts: [], totalMinutes: 0 };
        shiftsByEmployee[employeeId].days[day].shifts.push(shift);
        shiftsByEmployee[employeeId].days[day].totalMinutes += (totalMinutes(shift) - getUnpaidMinutes(shift));
      });
      return shiftsByEmployee;
    }
    const shiftsByEmployee = getShiftsByEmployee();
    console.log(shiftsByEmployee)
    const { startDate } = this.props;
    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Employee</Table.HeaderCell>
            {[0,1,2,3,4,5,6].map(offset => (
              <Table.HeaderCell key={offset}>{moment(startDate).add(offset, 'days').format('dd D/M')}</Table.HeaderCell>
            ))}
            <Table.HeaderCell>M-F</Table.HeaderCell>
            <Table.HeaderCell>S-S</Table.HeaderCell>
            <Table.HeaderCell>Total</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.keys(shiftsByEmployee).sort((a,b) => shiftsByEmployee[a].employee.firstName > shiftsByEmployee[b].employee.firstName).map(employeeId => (
            <Table.Row key={employeeId}>
              <Table.Cell>{shiftsByEmployee[employeeId].employee.firstName}</Table.Cell>
              {[0,1,2,3,4,5,6].map(offset => (
                <Table.Cell key={offset}>?</Table.Cell>
              ))}
              <Table.Cell>mf</Table.Cell>
              <Table.Cell>ss</Table.Cell>
              <Table.Cell>t</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
}
 
export default WeeklyReport;
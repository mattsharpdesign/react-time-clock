import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';
import { totalMinutes, getUnpaidMinutes } from '../shift-time-functions';
import { minutesToHoursAndMinutes } from '../date-functions';
import { observer } from 'mobx-react';

class WeeklyReport extends Component {
  state = {  }
  render() { 
    const { shifts, employees } = this.props;
    console.log(shifts);
    function getShiftsByEmployee() {
      let shiftsByEmployee = {};
      shifts.forEach(shift => {
        const employeeId = shift.employee.id;
        if (!shiftsByEmployee[employeeId]) shiftsByEmployee[employeeId] = { employee: shift.employee, days: {}, totalWeekdays: 0, totalWeekends: 0, totalMinutes: 0 }
        const datestamp = moment(shift.start.timestamp.toDate()).format('YYYY-MM-DD');
        if (!shiftsByEmployee[employeeId].days[datestamp]) shiftsByEmployee[employeeId].days[datestamp] = { shifts: [], totalMinutes: 0 };
        shiftsByEmployee[employeeId].days[datestamp].shifts.push(shift);
        const shiftMinutes = totalMinutes(shift) - getUnpaidMinutes(shift);
        shiftsByEmployee[employeeId].days[datestamp].totalMinutes += shiftMinutes;
        shiftsByEmployee[employeeId].totalMinutes += shiftMinutes;
        const day = moment(shift.start.timestamp.toDate()).day();
        if (day === 0 || day === 6) {
          shiftsByEmployee[employeeId].totalWeekends += shiftMinutes;
        } else {
          shiftsByEmployee[employeeId].totalWeekdays += shiftMinutes;
        }
      });
      /**
       * Add current employees who do not have any shifts approved
       */
      employees.forEach(e => {
        if (!shiftsByEmployee[e.id]) {
          shiftsByEmployee[e.id] = { warning: true, employee: e, days: {}, totalWeekdays: 0, totalWeekends: 0, totalMinutes: 0 };
        }
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
              <Table.HeaderCell key={offset}>{moment(startDate).add(offset, 'days').format('ddd Do')}</Table.HeaderCell>
            ))}
            <Table.HeaderCell warning>M-F</Table.HeaderCell>
            <Table.HeaderCell warning>S-S</Table.HeaderCell>
            <Table.HeaderCell positive>Total</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.keys(shiftsByEmployee).sort((a,b) => shiftsByEmployee[a].employee.firstName > shiftsByEmployee[b].employee.firstName).map(employeeId => (
            <Table.Row key={employeeId} warning={shiftsByEmployee[employeeId].warning}>
              <Table.Cell>{shiftsByEmployee[employeeId].employee.firstName}</Table.Cell>
              {[0,1,2,3,4,5,6].map(offset => {
                const datestamp = moment(startDate).add(offset, 'days').format('YYYY-MM-DD');
                const output = shiftsByEmployee[employeeId].days[datestamp] ? minutesToHoursAndMinutes(shiftsByEmployee[employeeId].days[datestamp].totalMinutes) : '-';
                return <Table.Cell key={offset}>{output}</Table.Cell>
              })}
              <Table.Cell>{minutesToHoursAndMinutes(shiftsByEmployee[employeeId].totalWeekdays)}</Table.Cell>
              <Table.Cell>{minutesToHoursAndMinutes(shiftsByEmployee[employeeId].totalWeekends)}</Table.Cell>
              <Table.Cell>{minutesToHoursAndMinutes(shiftsByEmployee[employeeId].totalMinutes)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
}
 
export default observer(WeeklyReport);
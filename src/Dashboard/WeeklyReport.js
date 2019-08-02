import React, { Component } from 'react';
import { Table, Loader } from 'semantic-ui-react';
import moment from 'moment';
import { totalMinutes, getUnpaidMinutes } from '../shift-time-functions';
import { minutesToHoursAndMinutes, minutesToHoursRounded } from '../date-functions';
import { observer } from 'mobx-react';
import { db } from '../firebase-services';

class WeeklyReport extends Component {
  state = {
    employees: [],
    loading: false
  }

  componentDidMount() {
    this.loadEmployees();
  }
  
  loadEmployees = () => {
    this.setState({ loading: true });
    const accountId = this.props.user.accountId
    let employees = []
    db
      .collection('accounts')
      .doc(accountId)
      .collection('employees')
      .orderBy('lastName')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          employees.push({ ...doc.data(), id: doc.id })
        })
        this.setState({ employees, loading: false });
      });
  }
  
  getShiftsByEmployee(shifts, employees) {
    let shiftsByEmployee = {};
    shifts.forEach(shift => {
      const employeeId = shift.employee.id;
      if (!shiftsByEmployee[employeeId]) {
        shiftsByEmployee[employeeId] = { 
          // employee: shift.employee, 
          employee: employees.find(e => e.id === shift.employee.id) || shift.employee,
          days: {}, 
          totalWeekdays: 0, 
          totalWeekends: 0, 
          totalMinutes: 0,
          payableHoursWeekdays: 0,
          payableHoursWeekends: 0,
          payableHoursTotal: 0,
        }
      }
      const datestamp = moment(shift.start.timestamp.toDate()).format('YYYY-MM-DD');
      if (!shiftsByEmployee[employeeId].days[datestamp]) {
        shiftsByEmployee[employeeId].days[datestamp] = { shifts: [], totalMinutes: 0, payableHours: 0 };
      }
      shiftsByEmployee[employeeId].days[datestamp].shifts.push(shift);
      const shiftMinutes = totalMinutes(shift) - getUnpaidMinutes(shift);
      const payableHours = parseFloat(minutesToHoursRounded(shiftMinutes));
      shiftsByEmployee[employeeId].days[datestamp].totalMinutes += shiftMinutes;
      shiftsByEmployee[employeeId].days[datestamp].payableHours += payableHours;
      shiftsByEmployee[employeeId].totalMinutes += shiftMinutes;
      shiftsByEmployee[employeeId].payableHoursTotal += payableHours;
      const day = moment(shift.start.timestamp.toDate()).day();
      if (day === 0 || day === 6) {
        shiftsByEmployee[employeeId].totalWeekends += shiftMinutes;
        shiftsByEmployee[employeeId].payableHoursWeekends += payableHours;
      } else {
        shiftsByEmployee[employeeId].totalWeekdays += shiftMinutes;
        shiftsByEmployee[employeeId].payableHoursWeekdays += payableHours;
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

  render() { 
    const { shifts, startDate } = this.props;
    const { employees, loading } = this.state;
    if (loading) return <Loader active content='Loading employees' />
    const shiftsByEmployee = this.getShiftsByEmployee(shifts, employees);
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
          {Object.keys(shiftsByEmployee).sort((a,b) => shiftsByEmployee[a].employee.lastName > shiftsByEmployee[b].employee.lastName ? 1 : -1).map(employeeId => (
            <Table.Row key={employeeId} warning={shiftsByEmployee[employeeId].warning}>
              <Table.Cell>{shiftsByEmployee[employeeId].employee.lastName}, {shiftsByEmployee[employeeId].employee.firstName}</Table.Cell>
              {[0,1,2,3,4,5,6].map(offset => {
                const datestamp = moment(startDate).add(offset, 'days').format('YYYY-MM-DD');
                const output = shiftsByEmployee[employeeId].days[datestamp] ? minutesToHoursRounded(shiftsByEmployee[employeeId].days[datestamp].totalMinutes) : '-';
                const title = shiftsByEmployee[employeeId].days[datestamp] ? minutesToHoursAndMinutes(shiftsByEmployee[employeeId].days[datestamp].totalMinutes) : 'NA';
                return <Table.Cell key={offset} title={title}>{output}</Table.Cell>
              })}
              <Table.Cell warning>{parseFloat(shiftsByEmployee[employeeId].payableHoursWeekdays).toFixed(2)}</Table.Cell>
              <Table.Cell warning>{parseFloat(shiftsByEmployee[employeeId].payableHoursWeekends).toFixed(2)}</Table.Cell>
              <Table.Cell positive>{parseFloat(shiftsByEmployee[employeeId].payableHoursTotal).toFixed(2)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }
}
 
export default observer(WeeklyReport);
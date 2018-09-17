import React, { Component } from 'react';
import { Icon, Tab, Menu } from 'semantic-ui-react';
import ClockInForm from './ClockInForm';
import EmployeeCardGroup from './EmployeeCardGroup';
import { inject, observer } from 'mobx-react';

class TimeClock extends Component {
  state = {
    isClockInFormOpen: false,
    selectedEmployee: null
  }

  componentDidMount() {
    console.log('TimeClock did mount');
    // this.loadEmployees();
  }

  openClockInForm = employee => {
    console.log(employee);
    this.setState({ selectedEmployee: employee, isClockInFormOpen: true });
  }

  closeClockInForm = () => {
    this.setState({ selectedEmployee: null, isClockInFormOpen: false });
  }

  render() { 
    const { employees, currentShifts } = this.props.store;
    // const { /* employees,  */loading } = this.state;
    const { isClockInFormOpen, selectedEmployee } = this.state;

    function filteredEmployees(employees) {
      const here = [];
      const notHere = [];
      employees.forEach(e => {
        const index = currentShifts.findIndex(s => s.employee.id === e.id);
        if (index > -1) {
          here.push(e);
        } else {
          notHere.push(e);
        }
      });
      return { here, notHere };
    }

    const { here, notHere } = filteredEmployees(employees);

    const panes = [
      { menuItem: (
        <Menu.Item key={1} color='green'>
          <Icon name='sign-in' /> Clock In
        </Menu.Item>
      ), render: () => <EmployeeCardGroup employees={notHere} onSelect={this.openClockInForm} /> },
      { menuItem: (
        <Menu.Item key={2} color='red'>
          <Icon name='sign-out' /> Clock Out
        </Menu.Item>
      ), render: () => <EmployeeCardGroup employees={here} onSelect={this.openClockInForm} /> },
    ];

    return (
      <div>
        <Tab panes={panes} />
        {isClockInFormOpen &&
          <ClockInForm employee={selectedEmployee} onCancel={this.closeClockInForm} onClose={this.closeClockInForm} />
        }
      </div>
    );
  }
}
 
export default inject('store')(observer(TimeClock));
import React, { Component } from 'react';
import { /* Icon, Loader, Menu, Card, */ Modal, Tab } from 'semantic-ui-react';
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
          here.push({ ...e, currentShift: currentShifts[index] });
        } else {
          notHere.push(e);
        }
      });
      return { here, notHere };
    }

    const { here, notHere } = filteredEmployees(employees);

    const panes = [
      { menuItem: 'Not here', render: () => <EmployeeCardGroup employees={notHere} onSelect={this.openClockInForm} /> },
      { menuItem: 'Here', render: () => <EmployeeCardGroup employees={here} onSelect={this.openClockInForm} /> },
    ];

    return (
      <div>
        <Tab panes={panes} />
        <Modal basic size='fullscreen' open={isClockInFormOpen} closeIcon onClose={this.closeClockInForm}>
          <Modal.Header>Clock in or out</Modal.Header>
          <Modal.Content>
            <ClockInForm employee={selectedEmployee} onCancel={this.closeClockInForm} />
          </Modal.Content>
        </Modal>
        <ul>
          {currentShifts.map(s => <li key={s.id}>{s.id} ({s.employee.firstName} - {s.test})</li>)}
        </ul>
      </div>
    );
  }
}
 
export default inject('store')(observer(TimeClock));
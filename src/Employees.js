import React, { Component } from 'react';
import ClockInForm from './ClockInForm';
import { Icon, Loader, Menu } from 'semantic-ui-react';
import { loadEmployees } from './loadEmployees';

class Employees extends Component {
  state = {
    employees: [],
    loading: true,
  }

  constructor(props) {
    super(props);
    this.loadEmployees = loadEmployees.bind(this);
  }

  componentDidMount() {
    console.log('Employees did mount');
    this.loadEmployees();
  }

  openClockInForm = employee => {
    const shift = this.props.unfinishedShifts.find(s => s.employee.id === employee.id)
    this.setState({ isClockInFormOpen: true, selectedEmployee: employee, currentShift: shift });
  }

  closeClockInForm = () => {
    this.setState({ isClockInFormOpen: false });
  }

  render() { 
    const { employees, loading } = this.state;
    if (loading) return <Loader active content='Loading employees' />
    return (
      <div>
        <Loader active={loading} content='Loading employees' />
        <Menu secondary>
          <Menu.Item header>Manage Your Employees</Menu.Item>
          <Menu.Item position='right' onClick={this.loadEmployees}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <ul>
          {employees.map(e => <li key={e.id}>{e.firstName} ({e.id})</li>)}
        </ul>
      </div>
    )
  }
}
 
export default Employees;
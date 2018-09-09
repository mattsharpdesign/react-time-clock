import React, { Component } from 'react';
// import ClockInForm from './ClockInForm';
import { Icon, Loader, Menu, List } from 'semantic-ui-react';
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
    return (
      <div>
        <Loader active={loading} content='Loading employees' />
        <Menu secondary>
          <Menu.Item header>Manage Your Employees</Menu.Item>
          <Menu.Item position='right' onClick={this.loadEmployees}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <List relaxed>
          {employees.map(e => <List.Item key={e.id}>{e.lastName}, {e.firstName} ({e.id})</List.Item>)}
        </List>
      </div>
    )
  }
}
 
export default Employees;
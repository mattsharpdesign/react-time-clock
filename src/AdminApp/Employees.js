import React, { Component } from 'react';
import { Icon, Menu, Modal, List } from 'semantic-ui-react';
import EmployeeListItem from './EmployeeListItem';
import EmployeeForm from './EmployeeForm';
import { db } from '../firebase-services';

class Employees extends Component {
  state = {
    employees: [],
    isLoading: false
  }

  componentDidMount() {
    this.refresh()
  }

  refresh = () => {
    this.setState({ isLoading: true });
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
        this.setState({ employees, isLoading: false });
      });
  }

  editEmployee = (employee = {}) => {
    this.setState({ selectedEmployee: employee, isFormOpen: true })
  }

  closeForm = (shouldRefresh = false) => {
    if (shouldRefresh === true) this.refresh();
    this.setState({ selectedEmployee: null, isFormOpen: false });
  }

  render() { 
    const { employees, isLoading } = this.state;
    return (
      <div>
        <Menu secondary>
          <Menu.Item header>Manage Your Employees</Menu.Item>
          <Menu.Item position='right' onClick={this.refresh}><Icon name='refresh' />{isLoading ? ' Loading...' : ' Refresh'}</Menu.Item>
          <Menu.Item position='right' onClick={this.editEmployee}><Icon name='plus' /> Add Employee</Menu.Item>
        </Menu>
        <List relaxed='very'>
          {employees.sort((a,b) => a.lastName > b.lastName ? 1 : -1).map(e => <EmployeeListItem onSelect={this.editEmployee} key={e.id} employee={e} />)}
        </List>
        <Modal open={this.state.isFormOpen} closeIcon onClose={this.closeForm}>
          <Modal.Header>Employee form</Modal.Header>
          <Modal.Content>
            <EmployeeForm
              employee={this.state.selectedEmployee}
              handleClose={this.closeForm}
              user={this.props.user} 
            />
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}
 
export default Employees;
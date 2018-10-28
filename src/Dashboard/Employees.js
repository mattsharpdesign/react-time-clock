import React, { Component } from 'react';
import { Icon, Menu, Modal, List } from 'semantic-ui-react';
import EmployeeListItem from './EmployeeListItem';
import EmployeeForm from './EmployeeForm';
// import { inject, observer } from 'mobx-react';

class Employees extends Component {
  state = {
    employees: [],
  }

  componentDidMount() {
    console.log('Employees did mount');
  }

  editEmployee = (employee = {}) => {
    this.setState({ selectedEmployee: employee, isFormOpen: true })
  }

  closeForm = () => this.setState({ selectedEmployee: null, isFormOpen: false });

  render() { 
    const { employees } = this.props;
    return (
      <div>
        <Menu secondary>
          <Menu.Item header>Manage Your Employees</Menu.Item>
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
              authUser={this.props.user} 
            />
          </Modal.Content>
        </Modal>
      </div>
    )
  }
}
 
// export default inject('store')(observer(Employees));
export default Employees;
import React, { Component } from 'react';
import { Icon, Loader, Menu, List } from 'semantic-ui-react';
import EmployeeListItem from './EmployeeListItem';
import { inject, observer } from 'mobx-react';

class Employees extends Component {
  state = {
    employees: [],
  }

  componentDidMount() {
    console.log('Employees did mount');
    this.refresh();
  }

  refresh = () => {
    this.props.store.fetchEmployees();
    // this.setState({ isLoading: true });
    // databaseLayer.fetchEmployees()
    //   .then(employees => this.setState({ employees, isLoading: false }))
    //   .catch(error => console.error(error));
  }

  render() { 
    // const { employees, isLoadingCurrentShifts, isloadingEmployees } = this.state;
    const { employees, loading } = this.props.store;
    return (
      <div>
        <Loader active={loading} content='Loading employees' />
        <Menu secondary>
          <Menu.Item header>Manage Your Employees</Menu.Item>
          <Menu.Item position='right' onClick={this.refresh}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <List relaxed='very'>
          {employees.sort((a,b) => a.lastName > b.lastName).map(e => <EmployeeListItem key={e.id} employee={e} />)}
        </List>
      </div>
    )
  }
}
 
export default inject('store')(observer(Employees));
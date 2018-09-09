import React, { Component } from 'react';
import { Icon, Loader, Menu, List } from 'semantic-ui-react';
import EmployeeListItem from './EmployeeListItem';
import { databaseLayer } from '.';
import { inject, observer } from 'mobx-react';

class Employees extends Component {
  state = {
    employees: [],
    isloadingEmployees: true,
    isLoadingCurrentShifts: true,
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
    const { employees } = this.props.store;
    return (
      <div>
        {/* <Loader active={isloadingEmployees} inline='centered' content='Loading employees' />
        <Loader active={isLoadingCurrentShifts} inline='centered' content='Loading current shifts' /> */}
        <Menu secondary>
          <Menu.Item header>Manage Your Employees</Menu.Item>
          <Menu.Item as='a' onClick={this.props.store.testAction}>{this.props.store.test}</Menu.Item>
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
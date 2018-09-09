import React, { Component } from 'react';
import { Icon, /* Loader,  */Menu } from 'semantic-ui-react';
// import { loadEmployees } from './loadEmployees';

class TimeClock extends Component {
  /* state = {
    employees: [],
    loading: true
  }

  constructor(props) {
    super(props);
    // this.loadEmployees = loadEmployees.bind(this);
  } */

  componentDidMount() {
    console.log('TimeClock did mount');
    // this.loadEmployees();
  }

  render() { 
    const { employees } = this.props;
    // const { /* employees,  */loading } = this.state;
    return (
      <div>
        {/* <Loader active={loading} content='Loading employees' /> */}
        <Menu secondary>
          <Menu.Item header>TimeClock</Menu.Item>
          <Menu.Item position='right' onClick={this.loadEmployees}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <ul>
          {employees.map(e => (
            <li key={e.id}>{e.firstName} ({e.id})</li>
          ))}
        </ul>
      </div>
    );
  }
}
 
export default TimeClock;
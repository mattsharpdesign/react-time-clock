import React, { Component } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import { Container, Loader, Menu, Popup, List } from 'semantic-ui-react';
import { auth } from '../firebase-services';
import Employees from './Employees';
import ApprovedShifts from './ApprovedShifts';
import Settings from './Settings';
import ApprovalQueue from './ApprovalQueue';
import { attachEmployeesListener, attachCurrentShiftsListener } from '../attachListeners';

class App extends Component {
  state = {
    loadingEmployees: true,
    loadingCurrentShifts: true,
    employees: [],
    currentShifts: []
  }

  listeners = [];

  constructor(props) {
    super(props);
    this.attachEmployeesListener = attachEmployeesListener.bind(this);
    this.attachCurrentShiftsListener = attachCurrentShiftsListener.bind(this);
  }

  componentDidMount() {
    console.log('Dashboard did mount at', new Date());
    const { user } = this.props;
    this.attachEmployeesListener(user.accountId);
    this.attachCurrentShiftsListener(user.accountId);
  }

  componentWillUnmount() {
    this.listeners.forEach(unsubscribe => unsubscribe());
  }

  signOut = () => auth.signOut();

  render() { 
    const { user } = this.props;
    const { employees, loadingEmployees, loadingCurrentShifts } = this.state;
    const isLoading = loadingEmployees || loadingCurrentShifts;
    return (
      <Router>
        <div>
          <Menu stackable>
            <Menu.Item header>TimeClock Admin</Menu.Item>
            <Menu.Item as={NavLink} to='/approval-queue'>Approval Queue</Menu.Item>
            <Menu.Item as={NavLink} to='/approved-shifts'>Approved Shifts</Menu.Item>
            <Menu.Item as={NavLink} to='/employees'>Employees</Menu.Item>
            <Popup 
              on='click' 
              trigger={<Menu.Item position='right'>{user.email}</Menu.Item>} 
            >
              <List relaxed='very'>
                <List.Item as={Link} to='/settings'>Settings</List.Item>
                <List.Item as='a' onClick={this.signOut}>Sign out</List.Item>
              </List>
            </Popup>
          </Menu>
          <Container>
            <Loader active={isLoading} content='Loading data' />
            <Switch>
              <Route path='/approval-queue' render={() => <ApprovalQueue />} />
              <Route path='/approved-shifts' render={() => <ApprovedShifts />} />
              <Route path='/employees' render={() => <Employees employees={employees} />} />
              <Route path='/settings' render={() => <Settings />} />
              <Redirect to='/employees' />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}
 
export default App;
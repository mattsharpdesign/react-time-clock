import React, { Component } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import { Container, Menu, Popup, List } from 'semantic-ui-react';
import { auth } from '../firebase-services';
import Employees from './Employees';
import ApprovedShifts from './ApprovedShifts';
import Settings from './Settings';
import ApprovalQueue from './ApprovalQueue';
import packageJson from '../../package.json'; 

class App extends Component {
  state = { }

  signOut = () => auth.signOut();

  render() { 
    const { user } = this.props;
    return (
      <Router>
        <div className='page-container'>
          <Menu stackable>
            <Menu.Item header>TimeClock Admin v{packageJson.version}</Menu.Item>
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
            <Switch>
              <Route path='/approval-queue' render={() => <ApprovalQueue user={user} />} />
              <Route path='/approved-shifts' render={() => <ApprovedShifts  user={user} />} />
              <Route path='/employees' render={() => <Employees user={user} />} />
              <Route path='/settings' render={() => <Settings user={user} />} />
              <Redirect to='/approval-queue' />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}
 
export default App;
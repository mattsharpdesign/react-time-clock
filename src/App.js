import React, { Component } from 'react';
import SignIn from './SignIn';
import Employees from './Employees';
import ApprovalQueue from './ApprovalQueue';
import { Container, Loader, Menu, Popup, List } from 'semantic-ui-react';
import ApprovedShifts from './ApprovedShifts';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import TimeClock from './TimeClock';
import Settings from './Settings';
import { inject, observer } from 'mobx-react';

class App extends Component {

  signOut = () => {
    this.props.store.signOut();
  }

  render() {
    const { authenticated, authenticating, loadingSettings, user } = this.props.store;
    if (authenticating) return <Loader active content='Authenticating' />
    if (!authenticated) return <SignIn />
    if (loadingSettings) return <Loader active content='Loading settings' />
    return (
      <Router>
        <div>
          <Menu stackable>
            <Menu.Item header>TimeKeeper</Menu.Item>
            <Menu.Item as={NavLink} to='/' exact>Home</Menu.Item>
            <Menu.Item as={NavLink} to='/current-shifts'>Current Shifts</Menu.Item>
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
              <Route path='/' exact render={() => <TimeClock />} />
              <Route path='/approval-queue' render={() => <ApprovalQueue />} />
              <Route path='/approved-shifts' render={() => <ApprovedShifts />} />
              <Route path='/employees' render={() => <Employees />} />
              <Route path='/settings' render={() => <Settings />} />
              <Redirect to='/' />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}

export default inject('store')(observer(App));

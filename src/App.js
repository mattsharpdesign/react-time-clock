import React, { Component } from 'react';
import { auth, db } from './firebase-services';
import SignIn from './SignIn';
import Employees from './Employees';
import ApprovalQueue from './ApprovalQueue';
import { Container, Loader, Menu, Popup, List } from 'semantic-ui-react';
import ApprovedShifts from './ApprovedShifts';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import TimeClock from './TimeClock';
import Settings from './Settings';
import { loadApprovalQueue, loadEmployees } from './setUpFirebaseListeners';

class App extends Component {
  state = {
    authenticating: true,
    loadingSettings: true,
    employees: [],
    unfinishedShifts: [],
    approvalQueue: [],
    weeklyReport: [],
    user: null
  }

  constructor(props) {
    super(props);
    this.loadEmployees = loadEmployees.bind(this);
    this.loadApprovalQueue = loadApprovalQueue.bind(this);
  }

  componentDidMount() {
    this.setState({ authenticating: true });
    auth.onAuthStateChanged(user => {
      this.setState({ authenticating: false });
      if (user) {
        this.setState({ loadingSettings: true });
        db.collection('users').doc(user.uid).get().then(doc => {
          const accountId = doc.data().account;
          this.dbRef = db.collection('accounts').doc(accountId);
          this.setState({ user: doc.data() });
          db.collection('accounts').doc(doc.data().account).get().then(doc => {
            this.setState({ loadingSettings: false, account: doc.data() });
          });
          this.loadEmployees(accountId);
          this.loadApprovalQueue(accountId);
        });
      }
    });
  }

  signOut = () => {
    auth.signOut();
  }

  render() {
    const { loadingSettings, loadingEmployees, authenticating, user, account } = this.state;
    if (authenticating) return <Loader active content='Authenticating' />
    if (!auth.currentUser) return <SignIn />
    if (loadingSettings) return <Loader active content='Loading account settings' />
    const dbRef = db.collection('accounts').doc(user.account);
    return (
      <Router>
        <div>
          <Loader active={loadingEmployees} content='Loading employees' />
          <Menu stackable>
            <Menu.Item header>TimeKeeper</Menu.Item>
            <Menu.Item as={NavLink} to='/' exact>Home</Menu.Item>
            <Menu.Item as={NavLink} to='/current-shifts'>Current Shifts</Menu.Item>
            <Menu.Item as={NavLink} to='/approval-queue'>Approval Queue</Menu.Item>
            <Menu.Item as={NavLink} to='/approved-shifts'>Approved Shifts</Menu.Item>
            <Menu.Item as={NavLink} to='/employees'>Employees</Menu.Item>
            <Popup 
              on='click' 
              trigger={<Menu.Item position='right'>{auth.currentUser.email}</Menu.Item>} 
            >
              <List relaxed='very'>
                <List.Item as={Link} to='/settings'>Settings</List.Item>
                <List.Item as='a' onClick={this.signOut}>Sign out</List.Item>
              </List>
            </Popup>
          </Menu>
          <Container>
            <Switch>
              <Route path='/' exact render={() => <TimeClock db={dbRef} employees={this.state.employees} />} />
              <Route path='/approval-queue' render={() => <ApprovalQueue db={dbRef} shifts={this.state.approvalQueue} />} />
              <Route path='/approved-shifts' render={() => <ApprovedShifts db={dbRef} account={account} />} />
              <Route path='/employees' render={() => <Employees db={dbRef} employees={this.state.employees} />} />
              <Route path='/settings' render={() => <Settings account={account} />} />
              <Redirect to='/' />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;

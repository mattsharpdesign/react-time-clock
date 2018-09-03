import React, { Component } from 'react';
import { auth, db } from './firebase-services';
import SignIn from './SignIn';
import Employees from './Employees';
// import UnfinishedShifts from './UnfinishedShifts';
import ApprovalQueue from './ApprovalQueue';
import moment from 'moment';
import { Container, Loader, Menu, Popup, List } from 'semantic-ui-react';
import ApprovedShifts from './ApprovedShifts';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import TimeClock from './TimeClock';
import Settings from './Settings';

function getIntBetween(min, max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}


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

  componentDidMount() {
    this.setState({ authenticating: true });
    auth.onAuthStateChanged(user => {
      this.setState({ authenticating: false });
      if (user) {
        this.setState({ loadingSettings: true });
        db.collection('users').doc(user.uid).get().then(doc => {
          this.setState({ user: doc.data() });
          db.collection('accounts').doc(doc.data().account).get().then(doc => {
            this.setState({ loadingSettings: false, account: doc.data() });
          });
        });
      }
    });
  }

  getStartOfPreviousWeek = weekStartsOn => {
    let date = moment();
    date.subtract(7, 'days');
    while (date.day() !== weekStartsOn) {
      date.subtract(1, 'days');
    }
    return date.toDate();
  }

  loadEmployees = accountId => {
    this.setState({ loading: true });
    db.collection('accounts').doc(accountId).collection('employees').orderBy('firstName').onSnapshot(snapshot => {
      this.updateStateFromSnapshot('employees', snapshot);
      this.setState({ loading: false });
    });
  }

  loadUnfinishedShifts = accountId => {
    db.collection('accounts').doc(accountId).collection('shifts').where('finishedAt', '==', null).onSnapshot(snapshot => {
      this.updateStateFromSnapshot('unfinishedShifts', snapshot);
    });
  }

  loadApprovalQueue = accountId => {
    db.collection('accounts').doc(accountId).collection('shifts')
      .where('start.timestamp', '>=', new Date(0))
      .where('isApproved', '==', false)
      .onSnapshot(snapshot => {
        this.updateStateFromSnapshot('approvalQueue', snapshot);
      });
  }

  loadWeeklyReport = (accountId, startDate) => {
    this.setState({ weeklyReport: [] });
    db.collection('accounts').doc(accountId).collection('shifts')
      .where('start.timestamp', '>=', startDate)
      .where('start.timestamp', '<', moment(startDate).add(7, 'days').toDate())
      .where('isApproved', '==', true)
      .onSnapshot(snapshot => {
        this.updateStateFromSnapshot('weeklyReport', snapshot);
      });
  }

  signOut = () => {
    auth.signOut();
  }

  updateStateFromSnapshot = (key, snapshot) => {
    let array = this.state[key].slice();
    snapshot.docChanges().forEach(change => {
      // Types of change are: 'added', 'modified', 'removed'
      // let index = -1;
      let index = array.findIndex(shift => shift.id === change.doc.id);
      switch (change.type) {
        case 'added':
          array.push({ ...change.doc.data(), id: change.doc.id });
          break;
        case 'modified':
          if (index > -1) {
            array.splice(index, 1, { ...change.doc.data(), id: change.doc.id });
          }
          break;
        case 'removed':
          index = array.findIndex(shift => shift.id === change.doc.id);
          if (index > -1) {
            array.splice(index, 1);
          }
          break;
        default:
          // do nothing...
      }
    });
    this.setState({ [key]: array });
    return;
  }

  generateSampleData = () => {
    const { accountSettings, employees } = this.state;
    const { weekStartsOn } = accountSettings;
    let shifts = [];
    let date = moment();
    let yesterday = moment().subtract(1, 'days');
    date.subtract(7, 'days');
    while (date.day() !== weekStartsOn) {
      date.subtract(1, 'days');
    }
    while (date.isBefore(yesterday)) {
      // console.log(date);
      if (date.day() !== 0) {
        employees.forEach(e => {
          if (date.day() === 6) {
            if (Math.random() < 0.3) {
              shifts.push({
                employee: e,
                start: { timestamp: moment(date).hour(8).minute(getIntBetween(0, 59)).toDate() },
                finish: { timestamp: moment(date).hour(14).minute(getIntBetween(0, 30)).toDate() },
                isApproved: false
              });
            }
          } else if (date.day() === 5) {
            let shift = {
              employee: e,
              start: { timestamp: moment(date).hour(8).minute(getIntBetween(14, 34)).toDate() },
              finish: { timestamp: moment(date).hour(14).minute(getIntBetween(50, 59)).toDate() },
              isApproved: false
            };
            shifts.push(shift);
          } else {
            let shift = {
              employee: e,
              start: { timestamp: moment(date).hour(7).minute(getIntBetween(14, 34)).toDate() },
              finish: { timestamp: moment(date).hour(12).minute(getIntBetween(30, 33)).toDate() },
              isApproved: false
            };
            if (Math.random() < 0.3) {
              shift.start.comment = 'Test start comment';
            }
            if (Math.random() < 0.3) {
              shift.finish.comment = 'Test finish comment';
            }
            shifts.push(shift);
            shifts.push({
              employee: e,
              start: { timestamp: moment(date).hour(13).minute(getIntBetween(0, 4)).toDate() },
              finish: { timestamp: moment(date).hour(16).minute(getIntBetween(0, 59)).toDate() },
              isApproved: false
            });
          }
        });
      }
      date.add(1, 'days');
    }
    console.log(shifts);
    const { user } = this.state;
    const shiftsRef = db.collection('accounts').doc(user.account).collection('shifts');
    shifts.forEach(shift => {
      shiftsRef.add(shift);
    });
  }

  render() {
    const { loadingSettings, authenticating, user, account } = this.state;
    if (authenticating) return <Loader active content='Authenticating' />
    if (!auth.currentUser) return <SignIn />
    if (loadingSettings) return <Loader active content='Loading account settings' />
    const dbRef = db.collection('accounts').doc(user.account);
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
              <Route path='/' exact render={() => <TimeClock db={dbRef} />} />
              <Route path='/approval-queue' render={() => <ApprovalQueue db={dbRef} />} />
              <Route path='/approved-shifts' render={() => <ApprovedShifts db={dbRef} account={account} />} />
              <Route path='/employees' render={() => <Employees db={dbRef} />} />
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

import React, { Component } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import { Container, Loader, Menu, Popup, List } from 'semantic-ui-react';
import { auth } from '../firebase-services';
import Employees from './Employees';
import ApprovedShifts from './ApprovedShifts';
import Settings from './Settings';
import ApprovalQueue from './ApprovalQueue';
import { attachEmployeesListener, attachCurrentShiftsListener, attachApprovalQueueListener } from '../attachListeners';
import { updateShift } from '../updateShift';
import { db } from '../firebase-services';
import moment from 'moment';
import { getStartOfPreviousWeek } from '../getStartOfPreviousWeek';

class App extends Component {
  state = {
    loadingEmployees: true,
    loadingCurrentShifts: true,
    loadingApprovalQueue: true,
    employees: [],
    currentShifts: [],
    approvedShifts: [],
    approvalQueue: []
  }

  listeners = [];

  constructor(props) {
    super(props);
    this.attachEmployeesListener = attachEmployeesListener.bind(this);
    this.attachCurrentShiftsListener = attachCurrentShiftsListener.bind(this);
    this.attachApprovalQueueListener = attachApprovalQueueListener.bind(this);
    this.updateShift = updateShift.bind(this);
  }

  componentDidMount() {
    console.log('Dashboard did mount at', new Date());
    const { user, accountSettings } = this.props;
    const startDate = getStartOfPreviousWeek(accountSettings.weekStartsOn);
    this.loadWeeklyReport(startDate);
    // this.setState({ weeklyReportStartDate });
    this.attachEmployeesListener(user.accountId);
    this.attachCurrentShiftsListener(user.accountId);
    this.attachApprovalQueueListener(user.accountId);
  }

  componentWillUnmount() {
    this.listeners.forEach(unsubscribe => unsubscribe());
  }

  signOut = () => auth.signOut();

  loadWeeklyReport = date => {
    this.setState({ loadingApprovedShifts: true });
    if (!date) date = this.state.weeklyReportStartDate;
    var startDate = moment(date).startOf('day').toDate();
    let endDate = moment(startDate).add(6, 'days').endOf('day').toDate();
    console.log('Loading shifts starting at', startDate, 'ending at', endDate);
    db.collection('accounts').doc(this.props.user.accountId).collection('shifts')
      .where('isApproved', '==', true)
      .where('start.timestamp', '>=', startDate)
      .where('start.timestamp', '<=', endDate)
      .get().then(snapshot => {
        const shifts = [];
        snapshot.docs.forEach(doc => {
          console.log(doc.data());
          shifts.push({ ...doc.data(), id: doc.id });
        });
        this.setState({ loadingApprovedShifts: false, weeklyReportStartDate: startDate, approvedShifts: shifts });
      });
  }

  render() { 
    const { user, accountSettings } = this.props;
    const { employees, approvalQueue, approvedShifts, loadingEmployees, loadingCurrentShifts, loadingApprovedShifts, loadingApprovalQueue, weeklyReportStartDate } = this.state;
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
              <Route path='/approval-queue' render={() => <ApprovalQueue user={user} approvalQueue={approvalQueue} loadingApprovalQueue={loadingApprovalQueue} />} />
              <Route path='/approved-shifts' render={() => (
                <ApprovedShifts 
                  user={user} 
                  startDate={weeklyReportStartDate} 
                  shifts={approvedShifts}
                  loading={loadingApprovedShifts}
                  reload={this.loadWeeklyReport} 
                  employees={employees} 
                  accountSettings={accountSettings} 
                />
              )} />
              <Route path='/employees' render={() => <Employees user={user} employees={employees} />} />
              <Route path='/settings' render={() => <Settings user={user} accountSettings={accountSettings} />} />
              <Redirect to='/employees' />
            </Switch>
          </Container>
        </div>
      </Router>
    );
  }
}
 
export default App;
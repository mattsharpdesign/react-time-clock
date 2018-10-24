import React, { Component } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route, Switch, Redirect } from 'react-router-dom';
import { Container, Loader, Menu, Popup, List } from 'semantic-ui-react';
import { auth } from '../firebase-services';
import Employees from './Employees';
import ApprovedShifts from './ApprovedShifts';
import Settings from './Settings';
import ApprovalQueue from './ApprovalQueue';
import { attachEmployeesListener } from '../attachListeners';
import { updateShift } from '../updateShift';
import { db } from '../firebase-services';
import moment from 'moment';
import { getStartOfPreviousWeek } from '../getStartOfPreviousWeek';
import packageJson from '../../package.json';

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
    // this.attachCurrentShiftsListener = attachCurrentShiftsListener.bind(this);
    // this.attachApprovalQueueListener = attachApprovalQueueListener.bind(this);
    this.updateShift = updateShift.bind(this);
  }

  componentDidMount() {
    console.log('Dashboard did mount at', new Date());
    const { user } = this.props;
    // const startDate = getStartOfPreviousWeek(accountSettings.weekStartsOn);
    this.loadWeeklyReport();
    // this.setState({ weeklyReportStartDate });
    this.attachEmployeesListener(user.accountId);
    // this.attachCurrentShiftsListener(user.accountId);
    // this.attachApprovalQueueListener(user.accountId);
  }

  componentWillUnmount() {
    this.listeners.forEach(unsubscribe => unsubscribe());
  }

  signOut = () => auth.signOut();

  changeWeeklyReportStartDate = date => {
    console.log(date)
    if (date._isAMomentObject) date = date.toDate()
    this.loadWeeklyReport(date)
    // this.setState({ weeklyReportStartDate: date }, this.loadWeeklyReport());
  }

  loadWeeklyReport = date => {
    this.setState({ loadingApprovedShifts: true });
    // if (!date) date = this.state.weeklyReportStartDate;
    if (!date) date = getStartOfPreviousWeek(this.props.accountSettings.weekStartsOn)
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
          shifts.push({ ...doc.data(), id: doc.id });
        });
        this.setState({ loadingApprovedShifts: false, weeklyReportStartDate: startDate, approvedShifts: shifts });
      });
  }

  render() { 
    const { user, accountSettings } = this.props;
    const { employees, approvedShifts, loadingEmployees, loadingApprovedShifts, weeklyReportStartDate } = this.state;
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
            <Loader active={loadingEmployees} content='Loading data' />
            <Switch>
              <Route path='/approval-queue' render={() => (
                <ApprovalQueue 
                  user={user} 
                  accountSettings={accountSettings} 
                />
              )} />
              <Route path='/approved-shifts' render={() => (
                <ApprovedShifts 
                  user={user} 
                  startDate={weeklyReportStartDate} 
                  shifts={approvedShifts}
                  loading={loadingApprovedShifts}
                  reload={() => this.loadWeeklyReport(this.state.weeklyReportStartDate)} 
                  onChangeDate={this.changeWeeklyReportStartDate}
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
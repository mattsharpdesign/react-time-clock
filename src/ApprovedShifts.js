import React, { Component } from 'react';
import moment from 'moment';
import { Loader, Menu, Icon, Tab } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ShiftsByDay from './ShiftsByDay';
import WeeklyReport from './WeeklyReport';
// import { loadEmployees } from './loadEmployees';
import { getStartOfPreviousWeek } from './getStartOfPreviousWeek';

class ApprovedShifts extends Component {
  constructor(props) {
    console.log('ApprovedShifts constructed');
    super(props);
    this.state = {
      shifts: [],
      employees: [],
      startDate: getStartOfPreviousWeek(props.account.weekStartsOn)
    };
    // this.loadEmployees = loadEmployees.bind(this);
  }

  componentDidMount() { 
    console.log('ApprovedShifts did mount')
    // this.loadEmployees();
    this.loadShifts();
  }

  loadShifts = () => {
    this.setState({ loading: true });
    const shifts = [];
    let startDate = moment(this.state.startDate).startOf('day').toDate();
    let endDate = moment(startDate).add(6, 'days').endOf('day').toDate();
    console.log('Loading shifts starting at', startDate, 'ending at', endDate);
    this.props.db.collection('shifts')
      .where('isApproved', '==', true)
      .where('start.timestamp', '>=', startDate)
      .where('start.timestamp', '<=', endDate)
      .get().then(snapshot => {
        snapshot.docs.forEach(doc => {
          shifts.push({ ...doc.data(), id: doc.id });
        });
        this.setState({ shifts, loading: false });
      });
  }

  setStartDate = date => {
    this.setState({ startDate: date }, this.loadShifts);
  }

  render() { 
    const { employees } = this.props;
    const { weekStartsOn } = this.props.account;
    const { loading, startDate, shifts/* , employees */ } = this.state;
    function isStartOfWeek(date) {
      return date.day() === weekStartsOn;
    }
    const panes = [
      { menuItem: 'Daily times', render: () => <ShiftsByDay shifts={shifts} /> },
      { menuItem: 'Weekly report', render: () => <WeeklyReport startDate={startDate} shifts={shifts} employees={employees} /> }
    ];
    return (
      <div>
        <Loader active={loading} content='Loading approved shifts' />
        <Menu secondary>
          <Menu.Item header>Approved Shifts for week beginning</Menu.Item>
          <Menu.Item>
            <DatePicker 
              selected={moment(startDate)} 
              onChange={this.setStartDate}
              filterDate={isStartOfWeek}
              customInput={<a href='#select-start-date'>{moment(startDate).format('dddd, D MMMM YYYY')}</a>} 
            />
            </Menu.Item>
            <Menu.Item position='right' onClick={this.loadShifts}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <Tab panes={panes} />
      </div>
    );
  }
}
 
export default ApprovedShifts;
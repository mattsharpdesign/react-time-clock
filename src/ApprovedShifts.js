import React, { Component } from 'react';
import moment from 'moment';
import { Loader, Menu } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import DayByDayReport from './ApprovalQueue';

function getStartOfPreviousWeek(weekStartsOn) {
  let date = moment();
  date.subtract(7, 'days');
  while (date.day() !== weekStartsOn) {
    date.subtract(1, 'days');
  }
  return date.toDate();
}

class ApprovedShifts extends Component {
  state = {  }
  constructor(props) {
    console.log('ApprovedShifts constructed');
    super(props);
    this.state = {
      startDate: getStartOfPreviousWeek(props.account.weekStartsOn)
    };
  }
  componentDidMount() { 
    console.log('ApprovedShifts did mount')
    this.loadShifts();
  }

  loadShifts = () => {
    this.setState({ loading: true });
    const shifts = [];
    this.props.db.collection('shifts').where('isApproved', '==', true).get().then(snapshot => {
      snapshot.docs.forEach(doc => {
        shifts.push({ ...doc.data(), id: doc.id });
      });
      this.setState({ shifts, loading: false });
    });
  }

  setStartDate = date => {
    this.setState({ startDate: date });
    this.loadShifts();
  }
  
  render() { 
    const { weekStartsOn } = this.props.account;
    const { loading, startDate, shifts } = this.state;
    function isStartOfWeek(date) {
      return date.day() === weekStartsOn;
    }
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
        </Menu>
        {/* <DayByDayReport shifts={shifts} /> */}
      </div>
    );
  }
}
 
export default ApprovedShifts;
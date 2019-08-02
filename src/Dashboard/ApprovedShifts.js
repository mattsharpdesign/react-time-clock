import React, { Component } from 'react';
import moment from 'moment';
import { Loader, Menu, Icon, Tab } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ShiftsByDay from './ShiftsByDay';
import WeeklyReport from './WeeklyReport';
import { getStartOfPreviousWeek } from '../getStartOfPreviousWeek';
import { db } from '../firebase-services';
// import { inject, observer } from 'mobx-react';

class ApprovedShifts extends Component {
  
  state = {
    shifts: [],
    startDate: null,
    loading: true
  }

  componentDidMount() {
    this.loadShifts();
  }

  loadShifts = date => {
    this.setState({ loading: true });
    if (!date) date = getStartOfPreviousWeek(this.props.user.account.weekStartsOn)
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
        this.setState({ shifts, startDate, loading: false });
      });
  }

  render() { 
    const { weekStartsOn } = this.props.user.account;
    const { shifts, startDate, loading } = this.state;
    const panes = [
      { menuItem: 'Daily times', render: () => <ShiftsByDay shifts={shifts} user={this.props.user} onRefresh={this.loadShifts} readonly={true} /> },
      { menuItem: 'Weekly report', render: () => <WeeklyReport user={this.props.user} startDate={startDate} shifts={shifts} onRefresh={this.loadShifts} /> }
    ];
    if (loading) return <Loader active={loading} content='Loading shifts' />
    return (
      <div>
        <Menu secondary>
          <Menu.Item header>Approved Shifts for week beginning</Menu.Item>
          <Menu.Item>
            <DatePicker 
              selected={moment(startDate)} 
              onChange={this.loadShifts}
              filterDate={date => date.day() === weekStartsOn}
              customInput={<a href='#select-start-date'>{moment(startDate).format('dddd, D MMMM YYYY')}</a>} 
            />
            </Menu.Item>
            <Menu.Item position='right' onClick={() => this.loadShifts(startDate)}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <Tab panes={panes} />
      </div>
    );
  }
}
 
// export default inject('store')(observer(ApprovedShifts));
export default ApprovedShifts;
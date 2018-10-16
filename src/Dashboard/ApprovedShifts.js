import React, { Component } from 'react';
import moment from 'moment';
import { Loader, Menu, Icon, Tab } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ShiftsByDay from './ShiftsByDay';
import WeeklyReport from './WeeklyReport';
// import { inject, observer } from 'mobx-react';

class ApprovedShifts extends Component {
  
  reload = () => {
    this.props.store.setWeeklyReportStartDate(this.props.store.weeklyReportStartDate);
  }

  render() { 
    const { employees, weeklyReportStartDate, setWeeklyReportStartDate, loadingWeeklyReport, weeklyReportShifts } = this.props.store;
    const { weekStartsOn } = this.props.store.account;
    // const { loading, startDate, shifts/* , employees */ } = this.state;
    const panes = [
      { menuItem: 'Daily times', render: () => <ShiftsByDay shifts={weeklyReportShifts} onReload={this.reload} /> },
      { menuItem: 'Weekly report', render: () => <WeeklyReport startDate={weeklyReportStartDate} shifts={weeklyReportShifts} employees={employees} /> }
    ];
    return (
      <div>
        <Loader active={loadingWeeklyReport} content='Loading approved shifts' />
        <Menu secondary>
          <Menu.Item header>Approved Shifts for week beginning</Menu.Item>
          <Menu.Item>
            <DatePicker 
              selected={moment(weeklyReportStartDate)} 
              onChange={setWeeklyReportStartDate}
              filterDate={date => date.day() === weekStartsOn}
              customInput={<a href='#select-start-date'>{moment(weeklyReportStartDate).format('dddd, D MMMM YYYY')}</a>} 
            />
            </Menu.Item>
            <Menu.Item position='right' onClick={this.reload}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <Tab panes={panes} />
      </div>
    );
  }
}
 
// export default inject('store')(observer(ApprovedShifts));
export default ApprovedShifts;
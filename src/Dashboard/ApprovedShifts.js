import React, { Component } from 'react';
import moment from 'moment';
import { Loader, Menu, Icon, Tab } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ShiftsByDay from './ShiftsByDay';
import WeeklyReport from './WeeklyReport';
// import { inject, observer } from 'mobx-react';

class ApprovedShifts extends Component {
  
  state = {
    shifts: [],
    loading: true
  }

  componentDidMount() {
    this.props.reload();
  }

  render() { 
    const { startDate, employees } = this.props;
    const { weekStartsOn } = this.props.accountSettings;
    const { shifts, loading } = this.props;
    const panes = [
      { menuItem: 'Daily times', render: () => <ShiftsByDay shifts={shifts} user={this.props.user} refresh={this.props.reload} readonly={true} /> },
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
              onChange={this.props.reload}
              filterDate={date => date.day() === weekStartsOn}
              customInput={<a href='#select-start-date'>{moment(startDate).format('dddd, D MMMM YYYY')}</a>} 
            />
            </Menu.Item>
            <Menu.Item position='right' onClick={this.props.reload}><Icon name='refresh' /> Reload</Menu.Item>
        </Menu>
        <Tab panes={panes} />
      </div>
    );
  }
}
 
// export default inject('store')(observer(ApprovedShifts));
export default ApprovedShifts;
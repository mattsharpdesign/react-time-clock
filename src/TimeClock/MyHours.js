import React, { Component } from 'react';
import { Loader, Menu, Message, Table, Container } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getStartOfPreviousWeek } from '../getStartOfPreviousWeek';
import { db } from '../firebase-services';
import { totalMinutes } from '../shift-time-functions'; 
import { minutesToHoursAndMinutes } from '../date-functions'; 

class Shift {
  constructor(id, data) {
    this.id = id;
    this.start = data.start;
    this.finish = data.finish;
    this.unpaidMinutes = data.unpaidMinutes || 0;
    this.isApproved = data.isApproved;
  }
}

function getTotalHours(shifts) {
  let approved = 0;
  let notApproved = 0;
  shifts.forEach(s => {
    if (!s.finish) return
    if (s.isApproved) {
      approved += (totalMinutes(s) - s.unpaidMinutes)
    } else {
      notApproved += (totalMinutes(s) - s.unpaidMinutes)
    }
  })
  return { approved, notApproved }
}

class MyHours extends Component {
  state = {
    shifts: []
  }
  componentDidMount() {
    console.log('MyHours did mount', this.props.employee)
    this.loadShifts()
  }
  loadShifts = date => {
    this.setState({ loading: true });
    if (!date) date = getStartOfPreviousWeek(this.props.weekStartsOn)
    if (date._isAMomentObject) date = date.toDate()
    var startDate = moment(date).startOf('day').toDate();
    let endDate = moment(startDate).add(6, 'days').endOf('day').toDate();
    console.log('Loading shifts for', this.props.employee.firstName, 'starting at', startDate, 'ending at', endDate);
    db.collection('accounts').doc(this.props.accountId).collection('shifts')
      .where('employeeId', '==', this.props.employee.id)
      .where('start.timestamp', '>=', startDate)
      .where('start.timestamp', '<=', endDate)
      .get().then(snapshot => {
        const shifts = [];
        snapshot.docs.forEach(doc => {
          const shift = new Shift(doc.id, doc.data());
          shifts.push(shift);
          // shifts.push({ ...doc.data(), id: doc.id });
        });
        console.log(shifts)
        this.setState({ loading: false, startDate: startDate, shifts: shifts });
      });
  }
  render() { 
    const { weekStartsOn } = this.props
    const { startDate, loading, shifts } = this.state
    const { approved, notApproved } = getTotalHours(shifts)
    return (
      <div>
        <Loader content='Loading' active={loading} />
        <Menu secondary>
          <Menu.Item header>Week beginning</Menu.Item>
          <Menu.Item>
            <DatePicker 
              selected={moment(startDate)} 
              onChange={this.loadShifts}
              filterDate={date => date.day() === weekStartsOn}
              customInput={<a href='#select-start-date'>{moment(startDate).format('dddd, D MMMM YYYY')}</a>} 
              />
            </Menu.Item>
            {/* <Menu.Item position='right' onClick={this.loadShifts}><Icon name='refresh' /> Reload</Menu.Item> */}
        </Menu>
        <Container>
          {shifts.length === 0 &&
            <Message info content='Could not find any shifts for that week.' />
          }
          {shifts.length > 0 &&
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Start</Table.HeaderCell>
                  <Table.HeaderCell>Finish</Table.HeaderCell>
                  <Table.HeaderCell>Break</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Footer>
                <Table.Row>
                  <Table.HeaderCell colSpan={4}>Approved hours</Table.HeaderCell>
                  <Table.HeaderCell>{minutesToHoursAndMinutes(approved)}</Table.HeaderCell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell colSpan={4}>Awaiting approval</Table.HeaderCell>
                  <Table.HeaderCell>{minutesToHoursAndMinutes(notApproved)}</Table.HeaderCell>
                </Table.Row>
              </Table.Footer>
              <Table.Body>
                {shifts.map(s => {
                  return (<Table.Row key={s.id} positive={!s.finish} warning={s.finish && !s.isApproved} title={s.id}>
                    <Table.Cell>{moment(s.start.timestamp.toDate()).format('dddd DD/MM')}</Table.Cell>
                    <Table.Cell>{moment(s.start.timestamp.toDate()).format('HH:mm')}</Table.Cell>
                    <Table.Cell>{s.finish ? moment(s.finish.timestamp.toDate()).format('HH:mm') : ''}</Table.Cell>
                    <Table.Cell>{s.unpaidMinutes}</Table.Cell>
                    <Table.Cell>{s.finish ? minutesToHoursAndMinutes(totalMinutes(s) - s.unpaidMinutes) : ''}</Table.Cell>
                  </Table.Row>)
                })}
              </Table.Body>
            </Table>
          }
        </Container>
      </div>
    );
  }
}
 
export default MyHours;
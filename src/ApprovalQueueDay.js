import React, { Component } from 'react';
import { Header, Table, Segment, Button } from 'semantic-ui-react';
import moment from 'moment';
import ApprovalQueueEmployee from './ApprovalQueueEmployee';
import { db } from './firebase-services';

class ApprovalQueueDay extends Component {
  state = {
    checkedShifts: []
  }

  getEmployees = () => {
    let employees = [];
    this.props.shifts.forEach(shift => {
      const found = employees.find(e => e.id === shift.employee.id);
      if (!found) {
        employees.push(shift.employee)
      }
      // if (employees.indexOf(shift.employee.id < 0)) employees.push(shift.employee.id)
    });
    return employees.sort((a,b) => a.firstName > b.firstName);
  }

  toggleChecked = id => {
    const checkedShifts = this.state.checkedShifts.slice();
    const index = checkedShifts.indexOf(id);
    if (index > -1) {
      checkedShifts.splice(index, 1);
    } else {
      checkedShifts.push(id);
    }
    this.setState({ checkedShifts });
  }

  approveSelected = () => {
    console.log(this.state.checkedShifts);
    const { user } = this.props;
    const { checkedShifts } = this.state;
    this.setState({ loading: true });
    checkedShifts.forEach(id => {
      db.collection('accounts').doc(user.account).collection('shifts').doc(id).update({
        isApproved: true
      }).then(() => {
        this.toggleChecked(id);
        this.setState({ loading: false });
      });
    });
  }

  render() { 
    const { date, shifts } = this.props;
    const { checkedShifts } = this.state;
    return (
      <Segment>
        <Header>{moment(date).format('ddd, D MMM YY')}</Header>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Employee</Table.HeaderCell>
              <Table.HeaderCell>Start</Table.HeaderCell>
              <Table.HeaderCell>Finish</Table.HeaderCell>
              <Table.HeaderCell>Break</Table.HeaderCell>
              <Table.HeaderCell>Hours</Table.HeaderCell>
              <Table.HeaderCell>Comment</Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.getEmployees().map(employee => (
              <ApprovalQueueEmployee key={employee.id} user={this.props.user} employee={employee} shifts={shifts.filter(s => s.employee.id === employee.id)} toggleChecked={this.toggleChecked} />
            ))}
          </Table.Body>
        </Table>
        <Button positive={checkedShifts.length > 0} disabled={checkedShifts.length < 1} onClick={this.approveSelected}>Approve Selected</Button>
      </Segment>
    );
  }
}
 
export default ApprovalQueueDay;
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
    const batch = db.batch();
    const { checkedShifts } = this.state;
    checkedShifts.forEach(id => {
      batch.update(this.props.db.collection('shifts').doc(id), { isApproved: true });
    });
    this.setState({ loading: true });
    batch.commit().then(() => {
      this.setState({ loading: false, checkedShifts: [] });
      this.props.onReload(); /* don't need to reload if we use Firebase realtime stuff */
    });
  }

  render() { 
    const { date, shifts } = this.props;
    const { checkedShifts, loading } = this.state;
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
              <ApprovalQueueEmployee key={employee.id} db={this.props.db} user={this.props.user} employee={employee} shifts={shifts.filter(s => s.employee.id === employee.id)} toggleChecked={this.toggleChecked} />
            ))}
          </Table.Body>
        </Table>
        <Button positive={checkedShifts.length > 0} disabled={checkedShifts.length < 1} loading={loading} onClick={this.approveSelected}>
          Approve Selected
        </Button>
      </Segment>
    );
  }
}
 
export default ApprovalQueueDay;
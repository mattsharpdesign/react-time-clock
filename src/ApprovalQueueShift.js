import React, { Component } from 'react';
import { minutesToHoursAndMinutes } from './date-functions';
import ApprovalQueueShiftEventCell from './ApprovalQueueShiftEventCell';
// import { db } from './firebase-services';
import { Table, Label, Input, /* Loader,  */Checkbox } from 'semantic-ui-react';
import { totalMinutes, getUnpaidMinutes } from './shift-time-functions';

class ApprovalQueueShift extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      comment: props.shift.supervisorComment || '',
      unpaidMinutes: getUnpaidMinutes(props.shift),
    }
  }

  openSupervisorCommentForm = () => {
    this.props.openSupervisorCommentForm(this.props.shift);
  }
  
  handleChangeComment = event => this.setState({ comment: event.target.value });
  
  handleChangeUnpaidMinutes = event => this.setState({ unpaidMinutes: event.target.value });
  
  updateShift = () => {
    const { shift } = this.props;
    const { comment, unpaidMinutes } = this.state;
    this.setState({ saving: true });
    this.props.db.collection('shifts').doc(shift.id).update({
      supervisorComment: comment,
      unpaidMinutes: unpaidMinutes,
    }).then(() => {
      this.setState({ saving: false });
    });
  }

  toggleChecked = () => {
    this.props.toggleChecked(this.props.shift.id);
  }

  render() { 
    const { employee, shift, isFirst } = this.props;
    const { comment, /* saving,  */unpaidMinutes } = this.state;
    return (
      <Table.Row>
        <Table.Cell>{isFirst && <Label ribbon color='blue'>{employee.firstName}</Label>}</Table.Cell>
        <ApprovalQueueShiftEventCell event={shift.start} />
        <ApprovalQueueShiftEventCell event={shift.finish} />
        <Table.Cell><Input fluid size='tiny' type='number' value={unpaidMinutes} onChange={this.handleChangeUnpaidMinutes} onBlur={this.updateShift} /></Table.Cell>
        <Table.Cell>{minutesToHoursAndMinutes(totalMinutes(shift) - unpaidMinutes)}</Table.Cell>
        <Table.Cell>
          <Input size='tiny' value={comment} onChange={this.handleChangeComment} onBlur={this.updateShift} />
        </Table.Cell>
        <Table.Cell>
          {/* <Loader inline size='tiny' active={saving} /> */}
          {/* !saving && */}
            <Checkbox checked={this.props.checked} onChange={this.toggleChecked} title={`ID: ${shift.id}`} />
          {/* */}
        </Table.Cell>
      </Table.Row>
    );
  }
}
 
export default ApprovalQueueShift;
import React, { Component } from 'react';
import { minutesToHoursAndMinutes } from '../date-functions';
import ApprovalQueueShiftEventCell from './ApprovalQueueShiftEventCell';
import { Table, Label, Input, /* Loader,  */Checkbox } from 'semantic-ui-react';
import { totalMinutes, getUnpaidMinutes } from '../shift-time-functions';
// import { inject, observer } from 'mobx-react';
// import { databaseLayer } from './index';
import { updateShift } from '../updateShift';

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
    this.setState({ saving: true });
    const { shift } = this.props;
    const { comment, unpaidMinutes } = this.state;
    updateShift(this.props.user.accountId, shift, {
        supervisorComment: comment,
        unpaidMinutes: unpaidMinutes,
      }).then(() => {
        this.setState({ saving: false });
      }).catch(error => {
        console.error(error);
        this.setState({ saving: false, error: error });
      });
  }

  toggleChecked = () => {
    this.props.toggleChecked(this.props.shift.id);
  }

  render() { 
    const { employee, shift, isFirst } = this.props;
    const { comment, saving, unpaidMinutes } = this.state;
    return (
      <Table.Row>
        <Table.Cell>
          {isFirst && <Label ribbon color='blue'>{saving ? 'Saving...' : employee.firstName}</Label>}
          {!isFirst && saving && <span>Saving...</span>}
        </Table.Cell>
        <ApprovalQueueShiftEventCell event={shift.start} />
        <ApprovalQueueShiftEventCell event={shift.finish} />
        <Table.Cell>
          {!this.props.isApprovedShifts &&
            <Input fluid size='tiny' type='number' value={unpaidMinutes} onChange={this.handleChangeUnpaidMinutes} onBlur={this.updateShift} />
          }
          {this.props.isApprovedShifts && <span>{unpaidMinutes}</span>}
        </Table.Cell>
        <Table.Cell>{minutesToHoursAndMinutes(totalMinutes(shift) - unpaidMinutes)}</Table.Cell>
        <Table.Cell>
          {!this.props.isApprovedShifts &&
            <Input size='tiny' value={comment} onChange={this.handleChangeComment} onBlur={this.updateShift} />
          }
          {this.props.isApprovedShifts && <span>{comment}</span>}
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
 
// export default inject('store')(observer(ApprovalQueueShift));
export default ApprovalQueueShift;
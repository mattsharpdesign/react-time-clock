import React, { Component } from 'react';
import { db } from './firebase-services';

class ClockInForm extends Component {
  state = {  }
  startWork = () => {
    const { employee, user } = this.props;
    console.log(employee.firstName, 'starting work');
    db.collection('accounts').doc(user.account).collection('shifts').add({
      employee: employee,
      startedAt: new Date(),
      finishedAt: null
    }).then(() => {
      this.props.handleCancel();
    });
  }
  stopWork = () => {
    const { currentShift, user } = this.props;
    db.collection('accounts').doc(user.account).collection('shifts').doc(currentShift.id).update({
      finishedAt: new Date()
    }).then(() => {
      this.props.handleCancel();
    });
  }
  render() { 
    const { employee, currentShift } = this.props;
    if (!employee) return null;
    return (
      <form>
        Employee: {employee.firstName}
        {!currentShift &&
          <button type='button' onClick={this.startWork}>Start work</button>
        }
        {currentShift &&
          <button type='button' onClick={this.stopWork}>Stop work</button>
        }
        <button type='button' onClick={this.props.handleCancel}>Cancel</button>
      </form>
    );
  }
}
 
export default ClockInForm;
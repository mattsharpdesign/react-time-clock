import React, { Component } from 'react';
import { databaseLayer } from './index';

class ClockInForm extends Component {
  state = {  }
  
  startWork = () => databaseLayer.startWork(this.props.employee).then(() => this.props.onCancel());

  stopWork = () => databaseLayer.stopWork(this.props.employee).then(() => this.props.onCancel());

  render() { 
    const { employee } = this.props;
    const { currentShift } = employee;
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
        <button type='button' onClick={this.props.onCancel}>Cancel</button>
      </form>
    );
  }
}
 
export default ClockInForm;
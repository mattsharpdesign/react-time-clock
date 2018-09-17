import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import placeholder from './profile_placeholder.png';
import { Button, Image, Modal } from 'semantic-ui-react';

class ClockInForm extends Component {
  state = {  }
  
  startWork = () => this.props.store.startWork(this.props.employee).then(() => this.props.onCancel());

  stopWork = () => this.props.store.stopWork(this.props.employee).then(() => this.props.onCancel());

  render() { 
    const { employee } = this.props;
    const { currentShift } = employee;
    if (!employee) return null;
    const profilePicUrl = employee.profilePicUrl || placeholder;
    return (
      <Modal open closeIcon onClose={this.props.onClose}>
        <Modal.Header>
          <Image avatar src={profilePicUrl} /> {employee.firstName}
        </Modal.Header>
        <Modal.Content>
          {!currentShift &&
            <Button positive type='button' onClick={this.startWork}>Start work</Button>
          }
          {currentShift &&
            <button type='button' onClick={this.stopWork}>Stop work</button>
          }
          <Button color='orange' type='button' onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Content>
      </Modal>
    );
  }
}
 
export default inject('store')(observer(ClockInForm));
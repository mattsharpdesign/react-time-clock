import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import placeholder from './profile_placeholder.png';
import { Button, Image, Modal, Message } from 'semantic-ui-react';
import Webcam from 'react-webcam';

class ClockInForm extends Component {
  state = {  }
  
  setRef = webcam => {
    this.webcam = webcam;
  };
  
  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    console.log(imageSrc)
  };

  onWebcamError = error => {
    console.log(error);
    console.log(this.webcam);
    // this.webcam.video.hidden = true;
    this.setState({ error: error });
  }

  startWork = () => this.props.store.startWork(this.props.employee).then(() => this.props.onCancel());

  stopWork = () => this.props.store.stopWork(this.props.employee).then(() => this.props.onCancel());

  render() { 
    const { error } = this.state;
    const { employee } = this.props;
    const { currentShift } = employee;
    if (!employee) return null;
    const profilePicUrl = employee.profilePicUrl || placeholder;
    const videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    };
    return (
      <Modal size='fullscreen' open closeIcon onClose={this.props.onClose}>
        <Modal.Header>
          <Image avatar src={profilePicUrl} /> {employee.firstName}
        </Modal.Header>
        <Modal.Content>
          <Webcam
            audio={false}
            height={350}
            ref={this.setRef}
            screenshotFormat="image/jpeg"
            width={350}
            // videoConstraints={videoConstraints}
            onUserMediaError={this.onWebcamError}
          />
          {!error &&
            <Message content='This is a test message...' />
          }
          {error &&
            <Message warning icon='eye slash outline' header='Camera not available' content={error.message} />
          }
        </Modal.Content>
        <Modal.Actions>
          {!currentShift &&
            <Button positive type='button' onClick={this.startWork}>Start work</Button>
          }
          {currentShift &&
            <button type='button' onClick={this.stopWork}>Stop work</button>
          }
          <Button color='orange' type='button' onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
 
export default inject('store')(observer(ClockInForm));
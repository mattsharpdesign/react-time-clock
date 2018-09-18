import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import placeholder from './profile_placeholder.png';
import { Button, Image, Input, Modal, Message, Form } from 'semantic-ui-react';
import Webcam from 'react-webcam';

class ClockInForm extends Component {
  state = {
    timer: -1
  }
  
  setRef = webcam => {
    this.webcam = webcam;
  };
  
  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    console.log(imageSrc)
  };

  onWebcamError = error => {
    // this.webcam.video.hidden = true;
    this.setState({ error: error });
  }

  startWork = () => {
    this.startCountdown();
    const screenshot = this.webcam.getScreenshot();
    console.log(screenshot);
    // this.props.store.startWork(this.props.employee).then(() => this.props.onCancel());
  }

  startCountdown = () => {
    this.setState({ timer: 3 });
    this.timerIntervalId = setInterval(() => {
      const newValue = this.state.timer - 1;
      if (newValue <= 0) {
        // take the photo and stop the timer
        clearInterval(this.timerIntervalId);
        const screenshot = this.webcam.getScreenshot();
        this.setState({ screenshot: screenshot });
        this.webcam.video.hidden = true;
      }
      this.setState({ timer: this.state.timer - 1 });
    }, 1000);
  }

  takeAgain = () => {
    this.setState({ screenshot: null });
    this.startCountdown();
  }

  componentWillUnmount() {
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
  }

  stopWork = () => this.props.store.stopWork(this.props.employee).then(() => this.props.onCancel());

  render() { 
    const { timer, error, screenshot } = this.state;
    const { employee } = this.props;
    const { currentShift } = employee;
    if (!employee) return null;
    const profilePicUrl = employee.profilePicUrl || placeholder;
    // const videoConstraints = {
    //   width: 1280,
    //   height: 720,
    //   facingMode: "user"
    // };
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
            screenshotWidth={350}
            width={350}
            // videoConstraints={videoConstraints}
            onUserMediaError={this.onWebcamError}
          />
          <Image src={screenshot} />
          {error &&
            <Message warning icon='eye slash outline' header='Camera not available' content={error.message} />
          }
        </Modal.Content>
        {screenshot &&
          <Modal.Actions>
            <Input type='text' placeholder='Comment?' action>
              <input />
              <Button positive content='Done' />
            </Input>
            <br />
            <Button color='orange' content='Take again' onClick={this.takeAgain} />
          </Modal.Actions>
        }
        {!screenshot &&
          <Modal.Actions>
            {!currentShift &&
              <Button positive type='button' onClick={this.startWork}>
                {timer > 0 ? timer : 'Start work'}
              </Button>
            }
            {currentShift &&
              <button type='button' onClick={this.stopWork}>Stop work</button>
            }
            <Button color='orange' type='button' onClick={this.props.onCancel}>Cancel</Button>
          </Modal.Actions>
        }
      </Modal>
    );
  }
}
 
export default inject('store')(observer(ClockInForm));
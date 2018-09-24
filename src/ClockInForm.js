import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import placeholder from './profile_placeholder.png';
import { Button, Image, Input, Modal, Message/* , Divider */ } from 'semantic-ui-react';
import Webcam from 'react-webcam';

class ClockInForm extends Component {
  
  state = {
    hasCamera: false,
    timer: -1,
    comment: '',
  }
  
  setRef = webcam => {
    this.webcam = webcam;
  };
  
  capture = () => {
    const imageSrc = this.webcam.getScreenshot();
    console.log(imageSrc)
  };

  onWebcam = () => {
    this.setState({ hasCamera: true });
  }

  onWebcamError = error => {
    this.setState({ hasCamera: false, error: error });
  }

  clockInOrOut = action => {
    this.setState({ action: action });
    if (this.state.hasCamera) {
      this.startCountdown();
    } else {
      this.setState({ confirming: true });
    }
    // const screenshot = this.webcam.getScreenshot();
    // console.log(screenshot);
    // this.props.store.startWork(this.props.employee).then(() => this.props.onCancel());
  }

  startCountdown = () => {
    this.setState({ timer: 3 });
    this.timerIntervalId = setInterval(() => {
      const newValue = this.state.timer - 1;
      if (newValue <= 0) {
        // take the photo and stop the timer
        clearInterval(this.timerIntervalId);
        const photo = this.webcam.getScreenshot();
        this.setState({ photo: photo, confirming: true });
        // this.webcam.video.hidden = true;
      }
      this.setState({ timer: this.state.timer - 1 });
    }, 1000);
  }

  takeAgain = () => {
    this.webcam.video.hidden = false;
    this.setState({ screenshot: null });
    this.startCountdown();
  }

  confirm = () => {
    const { action, comment, photo } = this.state;
    switch (action) {
      case 'start':
        console.log('Starting', comment, photo)
        break;
      case 'stop':
        console.log('Finishing', comment, photo)
        break;
      case 'pause':
        console.log('Leaving temporarily', comment, photo)
        break;
      default:
        console.log('Unknown action')
    }
  }

  componentWillUnmount() {
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
  }

  // stopWork = () => this.props.store.stopWork(this.props.employee).then(() => this.props.onCancel());

  handleChangeComment = event => this.setState({ comment: event.target.value });

  render() { 
    const { comment, confirming, timer, error, photo, hasCamera } = this.state;
    const { employee } = this.props;
    const isWorking = this.props.store.isEmployeeWorking(employee);
    if (!employee) return null;
    const profilePicUrl = employee.profilePicUrl || placeholder;
    return (
      <Modal open closeIcon onClose={this.props.onClose}>
        <Modal.Header>
          <Image avatar src={profilePicUrl} /> {employee.firstName}
        </Modal.Header>
        <Modal.Content>
          {!confirming &&
            <div className='clock-in-buttons'>
              {!isWorking &&
                <Button positive content='Start work' onClick={() => this.clockInOrOut('start')} />
              }
              {isWorking &&
                <React.Fragment>
                  <Button negative content='Finish work' onClick={() => this.clockInOrOut('stop')} />
                  <Button color='orange' content='Leave temporarily' onClick={() => this.clockInOrOut('pause')} />
                </React.Fragment>
              }
            </div>
          }
          {confirming &&
            <div>
              <Input fluid type='text' value={comment} onChange={this.handleChangeComment} placeholder='Add a comment?' />
              <br />
              <Button positive content='Done' onClick={this.confirm} />
              {hasCamera && <Button basic content='Take again' onClick={this.takeAgain} />}
            </div>
          }
          {timer > 0 &&
            <span>{timer}</span>
          }
          {!error &&
            <React.Fragment>
              {!photo &&
                <Webcam
                  audio={false}
                  ref={this.setRef}
                  height={350}
                  width={350}
                  screenshotWidth={350}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.5}
                  onUserMedia={this.onWebcam}
                  onUserMediaError={this.onWebcamError}
                />
              }
              {photo && <Image src={photo} />}
            </React.Fragment>
          }
          {error && !confirming &&
            <Message warning icon='eye slash outline' header='Camera not available' content={error.message} />
          }
        </Modal.Content>
      </Modal>
    );
  }
}
 
export default inject('store')(observer(ClockInForm));
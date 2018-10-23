import React, { Component } from 'react';
import { Icon, Image, Tab, Menu, Button, Container, Grid, Header, Form, Popup, Message } from 'semantic-ui-react';
import Webcam from 'react-webcam';
import EmployeeCardGroup from './EmployeeCardGroup';
import { attachEmployeesListener, attachCurrentShiftsListener } from '../attachListeners';
// import { inject, observer } from 'mobx-react';
import './TimeClock.css'
import placeholder from '../profile_placeholder.png';
import { auth, db } from '../firebase-services';
import shortid from 'shortid';
import localforage from 'localforage';
import appVersion from '../app-version';

class TimeClock extends Component {
  
  state = {
    employees: [],
    loadingEmployees: true,
    currentShifts: [],
    loadingCurrentShifts: true,
    isClockInFormOpen: false,
    selectedEmployee: null,
    mountWebcam: true,
    waitingForCamera: true,
    event: {}
  }

  listeners = [];
  unmountCameraInterval = null;
  store;
  
  constructor(props) {
    super(props);
    this.attachEmployeesListener = attachEmployeesListener.bind(this);
    this.attachCurrentShiftsListener = attachCurrentShiftsListener.bind(this);
  }

  signOut = () => auth.signOut();

  setRef = webcam => {
    this.webcam = webcam;
  };

  componentDidMount() {
    console.log('TimeClock did mount at', new Date());
    const { user } = this.props;
    this.store = localforage.createInstance({ name: 'timeclock-temp-data-storage' })
    this.attachEmployeesListener(user.accountId);
    this.attachCurrentShiftsListener(user.accountId);
  }

  componentWillUnmount() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    if (this.unmountCameraInterval) this.unmountCameraInterval();
  }

  openClockInForm = employee => {
    if (!this.state.mountWebcam) this.setState({ mountWebcam: true });
    console.log(employee);
    this.setState({ selectedEmployee: employee, isClockInFormOpen: true });
  }

  closeClockInForm = () => {
    this.setState({ selectedEmployee: null, isClockInFormOpen: false });
  }

  onCameraStreamAcquired = () => {
    this.setState({ waitingForCamera: false });
    this.unmountCameraInterval = setInterval(() => {
      if (!this.state.isClockInFormOpen) {
        this.setState({ mountWebcam: false });
      }
    }, 1000 * 60 * 10);
  }

  onCameraError = error => {
    console.log(error)
    this.setState({ cameraError: error.message, waitingForCamera: false });
  }

  handleChangeComment = (e, { name, value }) => this.setState({ comment: value })

  createEvent = (employee, eventType) => {
    const screenshotData = this.webcam.getScreenshot();
    const timestamp = new Date();
    const event = { employee, eventType, timestamp, screenshotData }
    this.setState({ event });
    console.log('event in state', event)
  }

  cancelEvent = () => {
    this.setState({ event: {} });
  }

  confirmEvent = () => {
    const { comment, event } = this.state;
    const { accountId } = this.props.user;
    console.log(event);
    const tempId = shortid.generate();
    this.store.setItem(tempId, event, () => console.log('event saved to temp storage', event));
    switch (event.eventType) {
      case 'start':
        db.collection('accounts').doc(accountId).collection('shifts').add({
          employeeId: event.employee.id,
          employee: event.employee,
          start: { timestamp: event.timestamp, comment: comment || null, screenshotData: event.screenshotData || null },
          finish: null,
          isApproved: false
        }).then(docRef => {
          console.log('Shift created with id', docRef.id);
          this.store.removeItem(tempId, () => console.log('temp item removed'));
        }).catch(error => console.error(error));
        break;
      case 'finish':
        const shift = this.state.currentShifts.find(shift => shift.employeeId === event.employee.id);
        db.collection('accounts').doc(accountId).collection('shifts').doc(shift.id).set({
          finish: {
            timestamp: event.timestamp,
            comment: comment || null,
            screenshotData: event.screenshotData || null,
          }
        }, { merge: true }).then(() => {
          this.store.removeItem(tempId, () => console.log('temp item removed'));
        }).catch(error => console.error('Error updating shift: ', error));
        break;
      default: 
        console.warn('eventType was neither start nor finish');
    }
    this.setState({ event: {}, isClockInFormOpen: false, comment: '' });
  }

  render() { 
    const { employees, currentShifts } = this.state;
    const { cameraError, comment, event, isClockInFormOpen, mountWebcam, selectedEmployee, waitingForCamera } = this.state;
    const profilePicUrl = selectedEmployee ? selectedEmployee.profilePicUrl || placeholder : null;
    const videoConstraints = {
      facingMode: "user"
    };
    const selectedEmployeeIsWorking = () => {
      if (currentShifts.findIndex(s => s.employeeId === selectedEmployee.id) > -1) {
        return true;
      } else {
        return false;
      }
    }
    function filteredEmployees(employees) {
      const here = [];
      const notHere = [];
      employees.forEach(e => {
        const index = currentShifts.findIndex(s => s.employeeId === e.id);
        if (index > -1) {
          here.push(e);
        } else {
          notHere.push(e);
        }
      });
      here.sort((a,b) => a.lastName > b.lastName ? 1 : -1)
      notHere.sort((a,b) => a.lastName > b.lastName ? 1 : -1)
      return { here, notHere };
    }

    const { here, notHere } = filteredEmployees(employees);

    const panes = [
      { menuItem: (
        <Menu.Item key={1} color='green'>
          <Icon name='sign-in' /> Clock In
        </Menu.Item>
      ), render: () => <EmployeeCardGroup visible={!isClockInFormOpen} employees={notHere} onSelect={this.openClockInForm} /> },
      { menuItem: (
        <Menu.Item key={2} color='red'>
          <Icon name='sign-out' /> Clock Out
        </Menu.Item>
      ), render: () => <EmployeeCardGroup visible={!isClockInFormOpen} employees={here} onSelect={this.openClockInForm} /> },
    ];

    return (
      <div>
        <Menu inverted>
          <Menu.Item header>TimeClock v{appVersion}</Menu.Item>
          <Popup 
              on='click' 
              trigger={<Menu.Item position='right'>{this.props.user.email}</Menu.Item>} 
            >
              <Button negative size='large' onClick={this.signOut} content='Disconnect app' />
            </Popup>
        </Menu>
        <Container style={{ paddingTop: '1em' }}>
          <Tab menu={{ pointing: true, size: 'massive' }} panes={panes} />
          {mountWebcam &&
            <Webcam
              audio={false}
              onUserMedia={this.onCameraStreamAcquired}
              onUserMediaError={this.onCameraError}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.6}
              screenshotWidth={350}
              style={{ visibility: isClockInFormOpen ? 'visible' : 'hidden' }}
              videoConstraints={videoConstraints}
            />
          }
          {isClockInFormOpen &&
            <div id='buttons-overlay'>
              <Header as='h2' inverted>
                <Image avatar src={profilePicUrl} /> {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
              </Header>
              {waitingForCamera &&
                <Message warning content='Waiting for camera...' />
              }
              {cameraError &&
                <Message warning>Camera error: {cameraError}</Message>
              }
              <Grid columns='equal' style={{ textAlign: 'center' }}>
                <Grid.Column>
                  {!selectedEmployeeIsWorking() &&
                    <Button positive size='massive' onClick={() => this.createEvent(selectedEmployee, 'start')} content='Start work' />
                  }
                  {selectedEmployeeIsWorking() &&
                    <Button negative size='massive' onClick={() => this.createEvent(selectedEmployee, 'finish')} content='Stop work' />
                  }
                </Grid.Column>
                <Grid.Column>
                  <Button basic color='orange' size='massive' onClick={this.closeClockInForm} content='Cancel' />
                </Grid.Column>
              </Grid>
            </div>
          }
          {event.screenshotData &&
            <div id='screenshot-backdrop'>
              <Image rounded centered src={event.screenshotData} alt='' />
              <Form style={{ paddingTop: '2em' }}>
                <Form.Input type='text' size='massive' placeholder='Add a comment?' value={comment} onChange={this.handleChangeComment} />
                <Form.Group>
                <Form.Button positive size='massive' onClick={this.confirmEvent} content='Done' />
                <Form.Button basic color='orange' size='massive' onClick={this.cancelEvent} content='Retake photo' />
                </Form.Group>
              </Form>
            </div>
          }
        </Container>
      </div>
    );
  }
}
 
// export default inject('store')(observer(TimeClock));
export default TimeClock;
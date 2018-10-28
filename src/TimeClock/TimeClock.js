import React, { Component } from 'react';
import { Icon, Image, List, Tab, Menu, Button, Container, Grid, Header, Form, Popup, Message, Modal } from 'semantic-ui-react';
import Webcam from 'react-webcam';
import EmployeeCardGroup from './EmployeeCardGroup';
import { attachEmployeesListener } from '../attachListeners';
import './TimeClock.css'
import placeholder from '../profile_placeholder.png';
import { auth, db } from '../firebase-services';
import shortid from 'shortid';
import localforage from 'localforage';
import packageJson from '../../package.json';
import MyHours from './MyHours';
import moment from 'moment';

class TimeClock extends Component {
  
  state = {
    employees: [],
    loadingEmployees: true,
    // currentShifts: [],
    loadingCurrentShifts: true,
    isClockInFormOpen: false,
    selectedEmployee: null,
    mountWebcam: true,
    waitingForCamera: true,
    currentEvent: null,
    comment: ''
  }

  listeners = [];
  unmountCameraInterval = null;
  store;
  
  constructor(props) {
    super(props);
    this.attachEmployeesListener = attachEmployeesListener.bind(this);
    // this.attachCurrentShiftsListener = attachCurrentShiftsListener.bind(this);
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
    // this.attachCurrentShiftsListener(user.accountId);
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
    this.setState({ currentEvent: event });
  }

  cancelEvent = () => {
    this.setState({ currentEvent: null });
  }

  openMyHours = () => this.setState({ isMyHoursOpen: true })

  closeMyHours = () => this.setState({ isMyHoursOpen: false })

  confirmEvent = () => {
    const event = this.state.currentEvent;
    const comment = this.state.comment;
    const { accountId } = this.props.user;
    console.log(event);
    const tempId = shortid.generate();
    this.store.setItem(tempId, event, () => console.log('event saved to temp storage', event));
    let newStatus, shiftId;
    switch (event.eventType) {
      case 'start':
        shiftId = `${moment().format('YYYYMMDD-HHmmss')}-${event.employee.lastName}-${event.employee.firstName}-${tempId}`
        newStatus = 1
        db.collection('accounts').doc(accountId).collection('shifts').doc(shiftId).set({
          employeeId: event.employee.id,
          employeeName: `${event.employee.lastName}, ${event.employee.firstName}`,
          employee: event.employee,
          start: { timestamp: event.timestamp, comment: comment || null, screenshotData: event.screenshotData || null },
          finish: null,
          isApproved: false,
          appVersion: packageJson.version
        }).then(docRef => {
          console.log('Shift created with id', shiftId);
          this.store.removeItem(tempId, () => console.log('temp item removed'));
        }).catch(error => console.error(error));
        break;
      case 'finish':
      case 'pause':
        db.collection('accounts').doc(accountId).collection('shifts').doc(event.employee.shiftId).set({
          finish: {
            timestamp: event.timestamp,
            comment: comment || null,
            screenshotData: event.screenshotData || null,
          }
        }, { merge: true }).then(() => {
          this.store.removeItem(tempId, () => console.log('temp item removed'));
        }).catch(error => console.error('Error updating shift: ', error));
        if (event.eventType === 'pause') {
          newStatus = 2
        } else {
          newStatus = 0
        }
        shiftId = null
        break;
      default: 
        console.warn('eventType was not any of start, finish, or pause');
    }
    db.collection('accounts').doc(accountId).collection('employees').doc(event.employee.id).set({
      status: newStatus,
      shiftId: shiftId
    }, { merge: true })
    this.setState({ currentEvent: null, isClockInFormOpen: false, comment: '' });
  }

  render() { 
    const { cameraError, comment, currentEvent, isClockInFormOpen, mountWebcam, selectedEmployee, waitingForCamera, isMyHoursOpen } = this.state;
    const profilePicUrl = selectedEmployee ? selectedEmployee.profilePicUrl || placeholder : null;
    const videoConstraints = {
      facingMode: "user"
    };
    const sortedEmployees = this.state.employees.sort((a,b) => a.lastName > b.lastName ? 1 : -1)

    const panes = [
      { menuItem: (
        <Menu.Item key={1}>
          <Icon name='users' /> Everyone
        </Menu.Item>
      ), render: () => <EmployeeCardGroup visible={!isClockInFormOpen} employees={sortedEmployees} onSelect={this.openClockInForm} /> },
      { menuItem: (
        <Menu.Item key={2} color='green'>
          <Icon name='sign-in' /> Here
        </Menu.Item>
      ), render: () => <EmployeeCardGroup visible={!isClockInFormOpen} employees={sortedEmployees} filter='here' onSelect={this.openClockInForm} /> },
      { menuItem: (
        <Menu.Item key={3} color='red'>
          <Icon name='sign-out' /> Not here
        </Menu.Item>
      ), render: () => <EmployeeCardGroup visible={!isClockInFormOpen} employees={sortedEmployees} filter='not here' onSelect={this.openClockInForm} /> },
    
    ];

    return (
      <div className='page-container'>
        <Menu inverted>
          <Menu.Item header>TimeClock v{packageJson.version}</Menu.Item>
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
              screenshotQuality={0.5}
              screenshotWidth={350}
              style={{ visibility: isClockInFormOpen ? currentEvent ? 'hidden' : 'visible' : 'hidden' }}
              videoConstraints={videoConstraints}
            />
          }
          {isClockInFormOpen &&
            <div id='buttons-overlay'>
              <Grid columns={2}>
                <Grid.Column>
                  <Header as='h2' inverted>
                    <Image avatar src={profilePicUrl} /> {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                  </Header>
                </Grid.Column>
                <Grid.Column textAlign='right'>
                  <Popup 
                    on='click' 
                    trigger={
                      <Button size='big' icon>
                        <Icon name='ellipsis vertical' />
                      </Button>
                    }
                  >
                    <List size='big' relaxed='very'>
                      <List.Item as='a' onClick={this.openMyHours}>My hours</List.Item>
                    </List>
                  </Popup>
                </Grid.Column>
              </Grid>
              {waitingForCamera &&
                <Message warning content='Waiting for camera...' />
              }
              {cameraError &&
                <Message warning>Camera error: {cameraError}</Message>
              }
              <Grid columns='equal' style={{ textAlign: 'center' }}>
                {selectedEmployee.status === 0 &&
                  <Grid.Column>
                    <Button positive size='massive' 
                      onClick={() => this.createEvent(selectedEmployee, 'start')} 
                      content='Start work'
                    />
                  </Grid.Column>
                }
                {selectedEmployee.status === 1 &&
                  <React.Fragment>
                    <Grid.Column>
                    <Button negative size='massive' 
                      onClick={() => this.createEvent(selectedEmployee, 'finish')} 
                      content='Finish work'
                    />
                    </Grid.Column>
                    <Grid.Column>
                    <Button color='orange' size='massive' 
                      onClick={() => this.createEvent(selectedEmployee, 'pause')} 
                      content='Stop work temporarily'
                    />
                    </Grid.Column>
                  </React.Fragment>
                }
                {selectedEmployee.status === 2 &&
                  <Grid.Column>
                    <Button positive size='massive' 
                      onClick={() => this.createEvent(selectedEmployee, 'start')} 
                      content='Resume work'
                    />
                  </Grid.Column>
                }
                <Grid.Column>
                  <Button basic color='orange' size='massive' onClick={this.closeClockInForm} content='Cancel' />
                </Grid.Column>
              </Grid>
            </div>
          }
          {currentEvent &&
            <div id='screenshot-backdrop'>
              <Image rounded centered src={currentEvent.screenshotData} alt='' />
              <Form style={{ paddingTop: '2em' }}>
                <Form.Input type='text' size='massive' placeholder='Add a comment?' value={comment} onChange={this.handleChangeComment} />
                <Form.Group>
                <Form.Button positive size='massive' onClick={this.confirmEvent} content='Done' />
                <Form.Button basic color='orange' size='massive' onClick={this.cancelEvent} content='Retake photo' />
                </Form.Group>
              </Form>
            </div>
          }
          {selectedEmployee &&
          <Modal open={isMyHoursOpen} size='fullscreen' closeIcon onClose={this.closeMyHours}>
            <Modal.Header><em>My Hours</em>{' '}for {selectedEmployee.firstName} {selectedEmployee.lastName}</Modal.Header>
            <Modal.Content>
              <MyHours 
                employee={selectedEmployee} 
                weekStartsOn={this.props.accountSettings.weekStartsOn} 
                defaultUnpaidMinutes={this.props.accountSettings.defaultUnpaidMinutes}
                accountId={this.props.user.accountId} 
              />
            </Modal.Content>
          </Modal>
          }
        </Container>
      </div>
    );
  }
}
 
// export default inject('store')(observer(TimeClock));
export default TimeClock;
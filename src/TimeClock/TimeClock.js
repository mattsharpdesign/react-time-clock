import React, { Component } from 'react';
import { Icon, Image, Tab, Menu, Button, Container, Grid, Header } from 'semantic-ui-react';
import Webcam from 'react-webcam';
import EmployeeCardGroup from './EmployeeCardGroup';
import { attachEmployeesListener, attachCurrentShiftsListener } from '../attachListeners';
// import { inject, observer } from 'mobx-react';
import './TimeClock.css'
import placeholder from '../profile_placeholder.png';

class TimeClock extends Component {
  
  state = {
    employees: [],
    loadingEmployees: true,
    currentShifts: [],
    loadingCurrentShifts: true,
    isClockInFormOpen: false,
    selectedEmployee: null,
    mountWebcam: true,
  }

  listeners = [];
  unmountCameraInterval = null;
  
  constructor(props) {
    super(props);
    this.attachEmployeesListener = attachEmployeesListener.bind(this);
    this.attachCurrentShiftsListener = attachCurrentShiftsListener.bind(this);
  }

  setRef = webcam => {
    this.webcam = webcam;
  };

  componentDidMount() {
    console.log('TimeClock did mount at', new Date());
    const { user } = this.props;
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
    this.unmountCameraInterval = setInterval(() => {
      if (!this.state.isClockInFormOpen) {
        this.setState({ mountWebcam: false });
      }
    }, 1000 * 60 * 10);
  }

  onCameraError = error => {
    console.log(error)
    this.setState({ cameraError: error.message });
  }

  render() { 
    const { employees, currentShifts } = this.state;
    const { cameraError, isClockInFormOpen, mountWebcam, screenshot, selectedEmployee } = this.state;
    const profilePicUrl = selectedEmployee ? selectedEmployee.profilePicUrl || placeholder : null;
    const videoConstraints = {
      facingMode: "user"
    };
    function filteredEmployees(employees) {
      const here = [];
      const notHere = [];
      employees.forEach(e => {
        const index = currentShifts.findIndex(s => s.employee.id === e.id);
        if (index > -1) {
          here.push(e);
        } else {
          notHere.push(e);
        }
      });
      return { here, notHere };
    }

    const { here, notHere } = filteredEmployees(employees);

    const panes = [
      { menuItem: (
        <Menu.Item key={1} color='green'>
          <Icon name='sign-in' /> Clock In
        </Menu.Item>
      ), render: () => <EmployeeCardGroup employees={notHere} onSelect={this.openClockInForm} /> },
      { menuItem: (
        <Menu.Item key={2} color='red'>
          <Icon name='sign-out' /> Clock Out
        </Menu.Item>
      ), render: () => <EmployeeCardGroup employees={here} onSelect={this.openClockInForm} /> },
    ];

    return (
      <div>
        {/* <Menu stackable>
          <Menu.Item header>TimeClock</Menu.Item>
        </Menu> */}
        <Container style={{ paddingTop: '1em' }}>
          {!isClockInFormOpen &&
            <Tab menu={{ pointing: true, size: 'massive' }} panes={panes} />
          }
          {/* <div id='video-backdrop' style={{ visibility: isClockInFormOpen ? 'visible' : 'hidden' }}> */}
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
                <Header as='h2' inverted color='teal'>
                  <Image avatar src={profilePicUrl} /> {selectedEmployee.firstName}
                </Header>
                <Grid columns='equal' style={{ textAlign: 'center' }}>
                  <Grid.Column>
                    <Button positive size='massive' onClick={this.capture} content='Start work' />
                  </Grid.Column>
                  <Grid.Column>
                    <Button basic negative size='massive' onClick={this.closeClockInForm} content='Cancel' />
                  </Grid.Column>
                </Grid>
              </div>
              // <Menu inverted fixed='bottom' size='massive'>
              //   <Menu.Item header>{selectedEmployee.firstName}</Menu.Item>
              //   <Menu.Item><Button positive onClick={this.capture} content='Start work' /></Menu.Item>
              //   <Menu.Item><Button basic negative onClick={this.closeClockInForm} content='Cancel' /></Menu.Item>
              // </Menu>
            }
          {/* </div> */}
          {screenshot &&
            <div id='screenshot-backdrop'>
              <img src={screenshot} alt='' />

              <button onClick={this.closeScreenshot}>Cancel</button>
            </div>
          }
          {cameraError &&
            <div>Camera error: {cameraError}</div>
          }
        </Container>
      </div>
    );
  }
}
 
// export default inject('store')(observer(TimeClock));
export default TimeClock;
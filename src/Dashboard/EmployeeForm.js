import React, { Component } from 'react';
import { Grid, Form, Button, Image, Icon, Message } from 'semantic-ui-react';
import placeholder from '../profile_placeholder.png';
import Dropzone from 'react-dropzone';
import { auth, db } from '../firebase-services';
import shortid from 'shortid';
import { uploadUserProfilePic } from '../storage-functions';

class EmployeeForm extends Component {

  state = { firstName: '', lastName: '', payrollId: '', loading: false, error: null, status: 'Loading' };

  componentDidMount() {
    const { firstName, lastName, payrollId, profilePicUrl } = this.props.employee;
    this.setState({ 
      firstName: firstName || '', 
      lastName: lastName || '',
      payrollId: payrollId || '',
      profilePicUrl: profilePicUrl || placeholder,
      newProfilePic: null
    });
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = async() => {
    this.setState({ loading: true });
    const employeeId = this.props.employee.id || shortid.generate();
    const data = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      payrollId: this.state.payrollId
    };
    if (this.state.newProfilePic) {
      var downloadUrl = await uploadUserProfilePic(this.props.authUser.accountId, employeeId, this.state.newProfilePic);
      data.profilePicUrl = downloadUrl;
    }
    db.collection('accounts')
      .doc(this.props.authUser.accountId)
      .collection('employees')
      .doc(employeeId)
      .set(data, { merge: true })
      .then(() => this.props.handleClose(true))
      .catch(err => {
        this.setState({ loading: false, error: err.message })
      });
  }

  handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      this.setState({ loading: true });
      const employeeId = this.props.employee.id;
      db.collection('accounts')
        .doc(auth.currentUser.uid)
        .collection('employees')
        .doc(employeeId)
        .delete()
        .then(() => this.props.handleClose(true))
        .catch(err => {
          this.setState({ loading: false, error: err.message })
        });
    }
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    this.setState({ newProfilePic: acceptedFiles[0]})
  }

  render() {
    const { payrollId } = this.state;
    let dropezoneRef;
    return (
      <Form onSubmit={this.handleSubmit} loading={this.state.loading}>
        <Grid columns={2} stackable>
          <Grid.Column>
            <Form.Input 
              required
              name='firstName' 
              label='First Name'
              placeholder='First Name'
              value={this.state.firstName} 
              onChange={this.handleChange} 
            />
            <Form.Input 
              required
              name='lastName' 
              label='Last Name'
              placeholder='Last Name'
              value={this.state.lastName} 
              onChange={this.handleChange} 
            />
            <Form.Input
              name='payrollId' 
              label='Payroll ID'
              placeholder='Payroll ID' 
              value={payrollId} 
              onChange={this.handleChange} 
            />
            <Dropzone 
              ref={node => dropezoneRef = node}
              accept='image/*' 
              multiple={false} 
              className='clickable ui big info message'
              onDrop={this.onDrop}>
              <Icon name='camera' />
              <p>Drag a profile pic here or click to select one.</p>
            </Dropzone>
          </Grid.Column>
          <Grid.Column>
            <Image 
              onClick={() => dropezoneRef.open()}
              src={
                this.state.newProfilePic
                ? this.state.newProfilePic.preview
                : this.state.profilePicUrl
              } 
              size='medium' 
            />
          </Grid.Column>
        </Grid>
        <Message error hidden={!this.state.error} content={this.state.error} />
        <Button type='button' disabled={!this.state.firstName} primary onClick={this.handleSubmit}>Save</Button>
        {/* <Button type='button' negative onClick={this.handleDelete}>Delete</Button> */}
      </Form>
    )
  }
}

export default EmployeeForm;

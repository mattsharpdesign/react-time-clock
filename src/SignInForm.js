import React, { Component } from 'react';
import { Modal, Form, Button, Message } from 'semantic-ui-react';
import { auth } from './firebase-services';

class SignInForm extends Component {
  
  state = { loading: false, email: '', password: '', error: null };

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  signIn = () => {
    this.setState({ loading: true });
    const { email, password } = this.state;
    auth.signInWithEmailAndPassword(email, password)
      // We don't need to do anything on successful sign in
      // as this form is only rendered if not signed in
      .catch(err => this.setState({ 
        loading: false,
        error: 'Could not sign in with those details'
      }));
  }

  render() {
    const { email, password } = this.state

    return (
      <Modal open={true}>
        <Modal.Header>Sign in to your account to continue</Modal.Header>
        <Modal.Content>
          <Form loading={this.state.loading}>
            <Form.Group widths='equal'>
              <Form.Input 
                type='email' 
                label='Email' 
                placeholder='Email' 
                name='email' 
                value={email} 
                onChange={this.handleChange} 
              />
              <Form.Input 
                type='password' 
                label='Password' 
                placeholder='Password' 
                name='password'
                value={password}
                onChange={this.handleChange}
              />
            </Form.Group>
          </Form>
          <Message error hidden={!this.state.error} content={this.state.error} />
        </Modal.Content>
        <Modal.Actions>
          <Button positive onClick={this.signIn}>Sign in</Button>
        </Modal.Actions>
      </Modal>
    )
  }

}

export default SignInForm;

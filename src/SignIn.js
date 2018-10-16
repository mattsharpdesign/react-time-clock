import React, { Component } from 'react';
import { auth } from './firebase-services';
import { Form, Button, Input } from 'semantic-ui-react';

class SignIn extends Component {
  state = {
    email: '',
    password: '',
    loading: false,
    error: null
  }

  componentDidMount() {
    window.signInOffice = () => {
      this.setState({ email: 'office@mattsharpdesign.com', password: 'dev 9000 mako' });
      this.signIn(null);
    }
    window.signInFactory = () => {
      this.setState({ email: 'factory@mattsharpdesign.com', password: 'dev 600 hikoi' });
      this.signIn(null);
    }
  }

  setEmail = e => this.setState({ email: e.target.value });

  setPassword = e => this.setState({ password: e.target.value });

  signIn = e => {
    if (e) e.preventDefault();
    this.setState({ loading: true, error: null });
    const { email, password } = this.state;
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ loading: false });
      })
      .catch(error => {
        console.error(error);
        this.setState({ loading: false, error: error });
      });
  }

  render() { 
    const { loading, error } = this.state;
    return (
      <Form onSubmit={this.signIn} loading={loading}>
        <Input type='email' placeholder='Email address' onChange={this.setEmail} />
        <Input type='password' placeholder='Password' onChange={this.setPassword} />
        <Button positive content='Sign in' />
        {loading && <span>Loading...</span>}
        {error && <em>{error.message}</em>}
      </Form>
    );
  }
}
 
export default SignIn;
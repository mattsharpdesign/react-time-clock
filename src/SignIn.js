import React, { Component } from 'react';
import { auth } from './fake-auth';

class SignIn extends Component {
  state = {
    email: '',
    password: '',
    loading: false,
    error: null
  }

  setEmail = e => this.setState({ email: e.target.value });

  setPassword = e => this.setState({ password: e.target.value });

  signIn = e => {
    e.preventDefault();
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

  handleSubmit = e => {
    e.preventDefault();
    const { email, password } = this.state;
    auth.signIn(email, password);
  }

  render() { 
    const { loading, error } = this.state;
    return (
      <form onSubmit={this.handleSubmit}>
        <input type='email' placeholder='Email address' onChange={this.setEmail} />
        <input type='password' placeholder='Password' onChange={this.setPassword} />
        <button>Sign in</button>
        {loading && <span>Loading...</span>}
        {error && <em>{error.message}</em>}
      </form>
    );
  }
}
 
export default SignIn;
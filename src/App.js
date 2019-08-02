import React, { Component } from 'react';
import SignInForm from './SignInForm';
import { Loader } from 'semantic-ui-react';
import { auth, db } from './firebase-services';
import AdminApp from './AdminApp/AdminApp';
import TimeClockApp from './TimeClockApp/TimeClockApp';

class App extends Component {

  state = {
    waitingForAuth: true,
    authenticated: false,
  };

  componentDidMount() {
    // Set up watcher for authentication changes
    auth.onAuthStateChanged(authUser => {
      this.setState({ waitingForAuth: false });
      if (authUser) {
        this.setState({ authenticated: true, loadingSettings: true });
        db.collection('users').doc(authUser.uid).get().then(doc => {
          const accountId = doc.data().accountId
          // this.setState({ user: doc.data() });
          let user = doc.data()
          db.collection('accounts').doc(accountId).get().then(doc => {
            user.account = doc.data()
            // this.account = { ...doc.data(), id: doc.id };
            this.setState({ user, loadingSettings: false });
          });
        });
      } else {
        this.setState({ authenticated: false, user: null });
      }
    });
  }
  
  render() {
    const { accountSettings, authenticated, loadingSettings, user, waitingForAuth } = this.state;
    if (waitingForAuth) return <Loader active content='Connecting to server' />
    if (!authenticated) return <SignInForm />
    if (loadingSettings) return <Loader active content='Loading settings' />
    if (user.role === 'admin') {
      return <AdminApp user={user} accountSettings={accountSettings} />
    } else {
      return <TimeClockApp user={user} accountSettings={accountSettings} />
    }
  }
}

export default App;

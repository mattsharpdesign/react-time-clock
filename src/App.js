import React, { Component } from 'react';
import SignInForm from './SignInForm';
import { Loader } from 'semantic-ui-react';
import { auth, db } from './firebase-services';
import Dashboard from './Dashboard/App';
import TimeClock from './TimeClock/TimeClock';
// import { inject, observer } from 'mobx-react';

window.signOut = () => auth.signOut();

class App extends Component {

  state = {
    waitingForAuth: true,
    authenticated: false,
  };

  dbRef; // firebase firestore ref for this account

  componentDidMount() {
    console.log('App did mount at', new Date());
    auth.onAuthStateChanged(authUser => {
      console.log('authStateChanged')
      this.setState({ waitingForAuth: false });
      if (authUser) {
        this.setState({ authenticated: true, loadingSettings: true });
        db.collection('users').doc(authUser.uid).get().then(doc => {
          this.setState({ user: doc.data() });
          db.collection('accounts').doc(doc.data().accountId).get().then(doc => {
            this.account = { ...doc.data(), id: doc.id };
            this.setState({ accountSettings: doc.data(), loadingSettings: false });
          });
        });
      } else {
        this.setState({ authenticated: false, user: null });
        // empty all data arrays, stop listening to database etc
      }
    });
  }
  
  signOut = () => {
    // this.props.store.signOut();
    auth.signOut();
  }

  render() {
    const { accountSettings, authenticated, loadingSettings, user, waitingForAuth } = this.state;
    if (waitingForAuth) return <Loader active content='Connecting to server' />
    if (!authenticated) return <SignInForm />
    if (loadingSettings) return <Loader active content='Loading settings' />
    if (user.role === 'admin') {
      return <Dashboard user={user} accountSettings={accountSettings} />
    } else {
      return <TimeClock user={user} accountSettings={accountSettings} />
    }
  }
}

// export default inject('store')(observer(App));
export default App;

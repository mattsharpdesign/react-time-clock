import React, { Component } from 'react';
import SignIn from './SignIn';
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
          this.setState({ loadingSettings: false, user: doc.data() });
          console.log('user in state', this.state.user);
          // this.user = { ...doc.data(), id: doc.id };
          // db.collection('accounts').doc(doc.data().accountId).get().then(doc => {
          //   this.account = { ...doc.data(), id: doc.id };
          //   this.loadingSettings = false;
          //   this.attachEmployeesListener();
          //   this.fetchCurrentShifts();
          //   this.attachApprovalQueueListener();
          //   this.setWeeklyReportStartDate();

          // });
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
    const { authenticated, loadingSettings, user, waitingForAuth } = this.state;
    if (waitingForAuth) return <Loader active content='Connecting to server' />
    if (!authenticated) return <SignIn />
    if (loadingSettings) return <Loader active content='Loading settings' />
    if (user.role === 'admin') {
      return <Dashboard user={user} />
    } else {
      return <TimeClock user={user} />
    }
  }
}

// export default inject('store')(observer(App));
export default App;

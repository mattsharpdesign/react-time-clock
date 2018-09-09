import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import SignIn from './SignIn';
import { auth, db } from './firebase-services';

class DatabaseLayer {
  databaseRef;
  // constructor(ref) {
  //   this.databaseRef = ref;
  // }
  startWork(employee, callback) {
    console.log(this.databaseRef);
    this.databaseRef.collection('shifts').add({
      employee: employee,
      start: { timestamp: new Date() },
      finish: null
    }).then(callback);
  }

  stopWork(employee, callback) {
    this.databaseRef.collection('shifts').doc(employee.currentShift.id).update({
      finish: { timestamp: new Date() }
    }).then(callback);
  }
}

export const databaseLayer = new DatabaseLayer();

const root = document.getElementById('root');


auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('users').doc(user.uid).get().then(doc => {
      databaseLayer.databaseRef = db.collection('accounts').doc(doc.data().account);
      ReactDOM.render(<App />, root);
    });
  } else {
    ReactDOM.render(<SignIn />, root);
  }
});

// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

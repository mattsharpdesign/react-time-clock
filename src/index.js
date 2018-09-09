import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import SignIn from './SignIn';
import { auth, db } from './firebase-services';

class DatabaseLayer {
  databaseRef;
  
  startWork(employee) {
    return new Promise((resolve, reject) => {
      this.databaseRef.collection('shifts').add({
        employee: employee,
        start: { timestamp: new Date() },
        finish: null,
        isApproved: false
      })
      .then(() => resolve())
      .catch(error => reject(error));
    });
  }

  stopWork(employee) {
    return new Promise((resolve, reject) => {
      this.databaseRef.collection('shifts').doc(employee.currentShift.id).update({
        finish: { timestamp: new Date() }
      })
      .then(() => resolve())
      .catch(error => reject(error));
    });
  }

  updateShift(shift, data) {
    const id = typeof shift === 'object' ? shift.id : shift;
    return new Promise((resolve, reject) => {
      this.databaseRef.collection('shifts').doc(id).update(data)
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }

  approveSelectedShifts(shifts) {
    return new Promise((resolve, reject) => {
      const batch = db.batch();
      shifts.forEach(id => {
        batch.update(this.databaseRef.collection('shifts').doc(id), { isApproved: true });
      });
      batch.commit()
        .then(() => resolve())
        .catch(error => reject(error));
    });
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

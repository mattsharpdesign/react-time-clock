import { auth, db } from './firebase-services';
import { extendObservable } from 'mobx';

export default class Store {

  constructor() {
    
    extendObservable(this, {
      authenticating: true,
      authenticated: false,
      loadingSettings: true,
      user: null,
      account: {},
      employees: [],
      currentShifts: [],
      approvalQueue: [],
      loading: false,
    });

    auth.onAuthStateChanged(user => {
      this.authenticating = false;
      this.authenticated = user ? true : false;
      if (user) {
        this.loadingSettings = true;
        db.collection('users').doc(user.uid).get().then(doc => {
          this.user = { ...doc.data(), id: doc.id };
          db.collection('accounts').doc(doc.data().accountId).get().then(doc => {
            this.account = { ...doc.data(), id: doc.id };
            this.loadingSettings = false;
            this.attachEmployeesListener();
            this.fetchCurrentShifts();
            this.attachApprovalQueueListener();
          });
        });
      } else {
        this.employees = [];
        this.currentShifts = [];
        this.approvalQueue = [];
        if (this.stopListeningToEmployees) this.stopListeningToEmployees();
        if (this.stopListeningToCurrentShifts) this.stopListeningToCurrentShifts();
        if (this.detachApprovalQueueListener) this.detachApprovalQueueListener();
      }
    });

  }

  signOut = () => {
    auth.signOut();
  }
  
  // fetchEmployees = () => {
  //   this.loading = true;
  //   const employees = [];
  //   this.databaseRef.collection('employees').get()
  //     .then(snapshot => {
  //       snapshot.docs.forEach(doc => {
  //         employees.push({ ...doc.data(), id: doc.id });
  //       });
  //       this.employees = employees;
  //       this.loading = false;
  //     });
  // }

  attachEmployeesListener = () => {
    this.stopListeningToEmployees = db.collection('accounts').doc(this.account.id)
      .collection('employees')
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          switch (change.type) {
            case 'added':
              this.employees.push({ ...change.doc.data(), id: change.doc.id });
              break;
            case 'modified':
              this.employees[change.oldIndex] = { ...change.doc.data(), id: change.doc.id };
              break;
            case 'removed':
              this.employees.splice(change.oldIndex, 1);
              break;
            default:
              console.log('Undefined change detected:', change.type);
          }
        });
      });
  }

  attachApprovalQueueListener = () => {
    this.detachApprovalQueueListener = db.collection('accounts').doc(this.account.id)
      .collection('shifts')
      .where('finish.timestamp', '>=', new Date(0))
      .where('isApproved', '==', false)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          switch (change.type) {
            case 'added':
              this.approvalQueue.push({ ...change.doc.data(), id: change.doc.id });
              break;
            case 'modified':
              this.approvalQueue[change.oldIndex] = { ...change.doc.data(), id: change.doc.id };
              break;
            case 'removed':
              this.approvalQueue.splice(change.oldIndex, 1);
              break;
            default:
              console.log('Undefined change detected:', change.type);
          }
        });
      });
  }

  fetchCurrentShifts = () => {
    this.stopListeningToCurrentShifts = db.collection('accounts').doc(this.account.id)
      .collection('shifts')
      .where('finish', '==', null)
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          switch (change.type) {
            case 'added':
              this.currentShifts.push({ ...change.doc.data(), id: change.doc.id });
              break;
            case 'modified':
              this.currentShifts[change.oldIndex] = { ...change.doc.data(), id: change.doc.id };
              break;
            case 'removed':
              this.currentShifts.splice(change.oldIndex, 1);
              break;
            default:
              console.log('Undefined change detected:', change.type);
          }
        });
      });
  }

  startWork = employee => {
    return new Promise((resolve, reject) => {
      db.collection('accounts').doc(this.account.id).collection('shifts').add({
        employee: employee,
        start: { timestamp: new Date() },
        finish: null,
        isApproved: false
      })
      .then(() => resolve())
      .catch(error => reject(error));
    });
  }

  stopWork = employee => {
    return new Promise((resolve, reject) => {
      const shift = this.currentShifts.find(s => s.employee.id === employee.id);
      db.collection('accounts').doc(this.account.id).collection('shifts').doc(shift.id).update({
        finish: { timestamp: new Date() }
      })
      .then(() => resolve())
      .catch(error => reject(error));
    });
  }

  updateShift = (shift, data) => {
    const id = typeof shift === 'object' ? shift.id : shift;
    return new Promise((resolve, reject) => {
      db.collection('accounts').doc(this.account.id).collection('shifts').doc(id).update(data)
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }

  approveSelectedShifts(shifts) {
    return new Promise((resolve, reject) => {
      const batch = db.batch();
      shifts.forEach(id => {
        batch.update(db.collection('accounts').doc(this.account.id).collection('shifts').doc(id), { isApproved: true });
      });
      batch.commit()
        .then(() => resolve())
        .catch(error => reject(error));
    });
  }
}
import { db } from './firebase-services';
import { extendObservable } from 'mobx';

export default class Store {

  databaseRef;

  constructor() {
    console.log('Store constructed');
    extendObservable(this, {
      employees: [],
      currentShifts: [],
      loading: false,
      test: 'some string',
    });
  }
  
  setDatabaseRef = ref => {
    this.databaseRef = ref;
    this.attachEmployeesListener();
    this.fetchCurrentShifts();
  }

  testAction = () => {
    this.test = 'some other string';
    console.log(this.test);
  }

  fetchEmployees = () => {
    this.loading = true;
    const employees = [];
    this.databaseRef.collection('employees').get()
      .then(snapshot => {
        snapshot.docs.forEach(doc => {
          employees.push({ ...doc.data(), id: doc.id });
        });
        this.employees = employees;
        this.loading = false;
      });
  }

  attachEmployeesListener = () => {
    this.databaseRef.collection('employees').onSnapshot(snapshot => {
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

  fetchCurrentShifts = () => {
    this.databaseRef.collection('shifts').where('finish', '==', null).onSnapshot(snapshot => {
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

  stopWork = employee => {
    return new Promise((resolve, reject) => {
      const shift = this.currentShifts.find(s => s.employee.id === employee.id);
      this.databaseRef.collection('shifts').doc(shift.id).update({
        finish: { timestamp: new Date() }
      })
      .then(() => resolve())
      .catch(error => reject(error));
    });
  }

  updateShift = (shift, data) => {
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
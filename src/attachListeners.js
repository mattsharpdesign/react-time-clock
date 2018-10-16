import { db } from './firebase-services';

export function attachEmployeesListener(accountId) {
  this.listeners.push(db.collection('accounts').doc(accountId)
    .collection('employees')
    .orderBy('lastName')
    .onSnapshot(snapshot => {
      const { employees } = this.state;
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            employees.push({ ...change.doc.data(), id: change.doc.id });
            break;
          case 'modified':
            employees[change.oldIndex] = { ...change.doc.data(), id: change.doc.id };
            break;
          case 'removed':
            employees.splice(change.oldIndex, 1);
            break;
          default:
            console.warn('Undefined change detected:', change.type);
        }
      });
      this.setState({ loadingEmployees: false, employees });
    })
  );
}

export function attachCurrentShiftsListener(accountId) {
  this.listeners.push(db.collection('accounts').doc(accountId)
    .collection('shifts')
    .where('finish', '==', null)
    .onSnapshot(snapshot => {
      const shifts = this.state.currentShifts;
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            shifts.push({ ...change.doc.data(), id: change.doc.id });
            break;
          case 'modified':
            shifts[change.oldIndex] = { ...change.doc.data(), id: change.doc.id };
            break;
          case 'removed':
            shifts.splice(change.oldIndex, 1);
            break;
          default:
            console.warn('Undefined change detected:', change.type);
        }
      });
      this.setState({ loadingCurrentShifts: false, currentShifts: shifts });
    })
  );
}

export function attachApprovalQueueListener(accountId) {
  this.listeners.push(db.collection('accounts').doc(accountId)
    .collection('shifts')
    .where('finish.timestamp', '>=', new Date(0))
    .where('isApproved', '==', false)
    .onSnapshot(snapshot => {
      const shifts = this.state.approvalQueue;
      snapshot.docChanges().forEach(change => {
        switch (change.type) {
          case 'added':
            shifts.push({ ...change.doc.data(), id: change.doc.id });
            break;
          case 'modified':
            shifts[change.oldIndex] = { ...change.doc.data(), id: change.doc.id };
            break;
          case 'removed':
            shifts.splice(change.oldIndex, 1);
            break;
          default:
            console.log('Undefined change detected:', change.type);
        }
      });
      this.setState({ loadingApprovalQueue: false, approvalQueue: shifts });
    })
  );
}
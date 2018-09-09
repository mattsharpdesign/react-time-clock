import { db } from './firebase-services';
import moment from 'moment';

export function loadEmployees(accountId) {
  this.updateStateFromSnapshot = updateStateFromSnapshot.bind(this);
  this.setState({ loadingEmployees: true });
  db.collection('accounts').doc(accountId).collection('employees').orderBy('lastName').onSnapshot(snapshot => {
    this.updateStateFromSnapshot('employees', snapshot);
    this.setState({ loadingEmployees: false });
  });
}

export function loadCurrentShifts(accountId) {
  this.updateStateFromSnapshot = updateStateFromSnapshot.bind(this);
  db.collection('accounts').doc(accountId).collection('shifts')
    .where('finishedAt', '==', null)
    .onSnapshot(snapshot => {
      this.updateStateFromSnapshot('currentShifts', snapshot);
    });
}

export function loadApprovalQueue(accountId) {
  this.updateStateFromSnapshot = updateStateFromSnapshot.bind(this);
  this.setState({ loadingApprovalQueue: true });
  db.collection('accounts').doc(accountId).collection('shifts')
    .where('isApproved', '==', false)
    .onSnapshot(snapshot => {
      this.updateStateFromSnapshot('approvalQueue', snapshot);
      this.setState({ loadingApprovalQueue: false });
    });
}

export function loadApprovedShifts(accountId, startDate) {
  this.updateStateFromSnapshot = updateStateFromSnapshot.bind(this);
  this.setState({ loadingApprovedShifts: true });
  startDate = moment(startDate).startOf('day').toDate();
  const endDate = moment(startDate).add(6, 'days').endOf('day').toDate();
  console.log('Loading shifts starting at', startDate, 'ending at', endDate);
  db.collection('accounts').doc(accountId).collection('shifts')
    .where('isApproved', '==', true)
    .where('start.timestamp', '>=', startDate)
    .where('start.timestamp', '<=', endDate)
    .onSnapshot(snapshot => {
      this.updateStateFromSnapshot('approvedShifts', snapshot);
      this.setState({ loadingApprovedShifts: false });
    });
}

function updateStateFromSnapshot(key, snapshot) {
  let array = this.state[key].slice();
  snapshot.docChanges().forEach(change => {
    // Types of change are: 'added', 'modified', 'removed'
    let index = array.findIndex(shift => shift.id === change.doc.id);
    switch (change.type) {
      case 'added':
        array.push({ ...change.doc.data(), id: change.doc.id });
        break;
      case 'modified':
        if (index > -1) {
          array.splice(index, 1, { ...change.doc.data(), id: change.doc.id });
        }
        break;
      case 'removed':
        index = array.findIndex(shift => shift.id === change.doc.id);
        if (index > -1) {
          array.splice(index, 1);
        }
        break;
      default:
        // do nothing...
    }
  });
  this.setState({ [key]: array });
  return;
}
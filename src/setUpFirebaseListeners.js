loadEmployees = accountId => {
  this.setState({ loading: true });
  db.collection('accounts').doc(accountId).collection('employees').orderBy('firstName').onSnapshot(snapshot => {
    this.updateStateFromSnapshot('employees', snapshot);
    this.setState({ loading: false });
  });
}

loadUnfinishedShifts = accountId => {
  db.collection('accounts').doc(accountId).collection('shifts').where('finishedAt', '==', null).onSnapshot(snapshot => {
    this.updateStateFromSnapshot('unfinishedShifts', snapshot);
  });
}

loadApprovalQueue = accountId => {
  db.collection('accounts').doc(accountId).collection('shifts')
    .where('start.timestamp', '>=', new Date(0))
    .where('isApproved', '==', false)
    .onSnapshot(snapshot => {
      this.updateStateFromSnapshot('approvalQueue', snapshot);
    });
}

loadWeeklyReport = (accountId, startDate) => {
  this.setState({ weeklyReport: [] });
  db.collection('accounts').doc(accountId).collection('shifts')
    .where('start.timestamp', '>=', startDate)
    .where('start.timestamp', '<', moment(startDate).add(7, 'days').toDate())
    .where('isApproved', '==', true)
    .onSnapshot(snapshot => {
      this.updateStateFromSnapshot('weeklyReport', snapshot);
    });
}

updateStateFromSnapshot = (key, snapshot) => {
  let array = this.state[key].slice();
  snapshot.docChanges().forEach(change => {
    // Types of change are: 'added', 'modified', 'removed'
    // let index = -1;
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
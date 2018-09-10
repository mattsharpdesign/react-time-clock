export default class DatabaseLayer {
  databaseRef;
  
  fetchEmployees() {
    const employees = [];
    return new Promise((resolve, reject) => {
      this.databaseRef.collection('employees').get()
        .then(snapshot => {
          snapshot.docs.forEach(doc => {
            employees.push({ ...doc.data(), id: doc.id });
          });
          resolve(employees);
        })
        .catch(error => reject(error));
    });
  }

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
import { db } from './firebase-services';

export function updateShift(accountId, shift, data) {
  const id = typeof shift === 'object' ? shift.id : shift;
  return new Promise((resolve, reject) => {
    db.collection('accounts').doc(accountId).collection('shifts').doc(id).update(data)
      .then(() => resolve())
      .catch(error => reject(error));
  });
}

export function approveSelectedShifts(accountId, shifts, approved = true) {
  return new Promise((resolve, reject) => {
    const batch = db.batch();
    shifts.forEach(id => {
      batch.update(db.collection('accounts').doc(accountId).collection('shifts').doc(id), { isApproved: approved });
    });
    batch.commit()
      .then(() => resolve())
      .catch(error => reject(error));
  });
}
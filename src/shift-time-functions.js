import moment from 'moment';

export const totalMinutes = shift => {
  return moment(shift.finish.timestamp.toDate()).diff(moment(shift.start.timestamp.toDate()), 'minutes');
}

export const getUnpaidMinutes = shift => {
  if (shift.hasOwnProperty('unpaidMinutes')) return shift.unpaidMinutes;
  return totalMinutes(shift) > 240 ? 30 : 0;
}
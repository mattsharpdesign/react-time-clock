import moment from 'moment';

export function getStartOfPreviousWeek(weekStartsOn) {
  let date = moment();
  date.subtract(7, 'days');
  while (date.day() !== weekStartsOn) {
    date.subtract(1, 'days');
  }
  return date.startOf('day').toDate();
}
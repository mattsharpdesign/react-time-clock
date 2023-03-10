import moment from 'moment';

export const timestampToHoursAndMinutes = timestamp => {
  return moment(timestamp.toDate()).format('HH:mm');
}

export const minutesToHoursAndMinutes = minutes => {
  let hours = Math.floor(minutes / 60);
  let remainingMinutes = minutes - (hours * 60);
  if (remainingMinutes.toString().length < 2) remainingMinutes = 0 + remainingMinutes.toString();  
  return hours + ':' + remainingMinutes;
}

export const minutesToHoursRounded = minutes => {
    let hours = minutes / 60;
    let roundedHours = Math.round(hours * 4) / 4
    return parseFloat(roundedHours).toFixed(2)
}
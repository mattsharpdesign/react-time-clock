generateSampleData = () => {
  const { accountSettings, employees } = this.state;
  const { weekStartsOn } = accountSettings;
  let shifts = [];
  let date = moment();
  let yesterday = moment().subtract(1, 'days');
  date.subtract(7, 'days');
  while (date.day() !== weekStartsOn) {
    date.subtract(1, 'days');
  }
  while (date.isBefore(yesterday)) {
    // console.log(date);
    if (date.day() !== 0) {
      employees.forEach(e => {
        if (date.day() === 6) {
          if (Math.random() < 0.3) {
            shifts.push({
              employee: e,
              start: { timestamp: moment(date).hour(8).minute(getIntBetween(0, 59)).toDate() },
              finish: { timestamp: moment(date).hour(14).minute(getIntBetween(0, 30)).toDate() },
              isApproved: false
            });
          }
        } else if (date.day() === 5) {
          let shift = {
            employee: e,
            start: { timestamp: moment(date).hour(8).minute(getIntBetween(14, 34)).toDate() },
            finish: { timestamp: moment(date).hour(14).minute(getIntBetween(50, 59)).toDate() },
            isApproved: false
          };
          shifts.push(shift);
        } else {
          let shift = {
            employee: e,
            start: { timestamp: moment(date).hour(7).minute(getIntBetween(14, 34)).toDate() },
            finish: { timestamp: moment(date).hour(12).minute(getIntBetween(30, 33)).toDate() },
            isApproved: false
          };
          if (Math.random() < 0.3) {
            shift.start.comment = 'Test start comment';
          }
          if (Math.random() < 0.3) {
            shift.finish.comment = 'Test finish comment';
          }
          shifts.push(shift);
          shifts.push({
            employee: e,
            start: { timestamp: moment(date).hour(13).minute(getIntBetween(0, 4)).toDate() },
            finish: { timestamp: moment(date).hour(16).minute(getIntBetween(0, 59)).toDate() },
            isApproved: false
          });
        }
      });
    }
    date.add(1, 'days');
  }
  console.log(shifts);
  const { user } = this.state;
  const shiftsRef = db.collection('accounts').doc(user.account).collection('shifts');
  shifts.forEach(shift => {
    shiftsRef.add(shift);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const getCurrentISODateOnly = (withOffset = false) => {
  if (withOffset) {
    let todaysDate= new Date();
    let offset = todaysDate.getTimezoneOffset();
    todaysDate = new Date(todaysDate.getTime() - (offset * 60 * 1000));
    return todaysDate.toISOString().split('T')[0];
  } else {
    let todaysDate = new Date();
    // todaysDate.setDate(todaysDate.getDate() - 1); // 1 day before
    return todaysDate.toISOString().split('T')[0];
  }
}

const getTimeRangeInMultipleOf5 = () => {
  let currentDateTime = new Date();
  let startTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate(), 0, 0, 0, 0);
  flooredMinMultipleOf5 = Math.floor(currentDateTime.getMinutes() / 5) * 5;
  let endTime = new Date(currentDateTime.getFullYear(), currentDateTime.getMonth(), currentDateTime.getDate(), currentDateTime.getHours(), flooredMinMultipleOf5, 0, 0);
  startFromEpoch = startTime / 1000;
  endFromEpoch = endTime / 1000;
  returnTimeRange = [startFromEpoch, endFromEpoch]
  return returnTimeRange;
}

module.exports = { sleep, getCurrentISODateOnly, getTimeRangeInMultipleOf5 }

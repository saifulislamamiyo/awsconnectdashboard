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



module.exports = { sleep, getCurrentISODateOnly }

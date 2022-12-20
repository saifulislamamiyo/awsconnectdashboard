const sleep = ms => new Promise(r => setTimeout(r, ms));

const getCurrentISODateOnly = (withOffset = false) => {
  if (withOffset) {
    const offset = todaysDate.getTimezoneOffset()
    let todaysDate = new Date(todaysDate.getTime() - (offset * 60 * 1000))
    return todaysDate.toISOString().split('T')[0]
  } else {
    let todaysDate = new Date()
    return todaysDate.toISOString().split('T')[0]
  }
}



module.exports = { sleep, getCurrentISODateOnly }

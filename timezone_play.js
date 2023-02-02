// let currentServerDateTime = new Date();
// let offset = 11 * 60; // Sydney Timezone GMT+11
// let currentSydneyDateTime = new Date(currentServerDateTime.getTime() - offset * 60 * 1000);
// let currentSydneyMidNight = new Date(currentSydneyDateTime.getFullYear(), currentSydneyDateTime.getMonth(), currentSydneyDateTime.getDate(), 0, 0, 1, 0);
// let currentSydneyMidNightEpoch = currentSydneyMidNight.getTime() / 1000
// let startFromEpoch = currentSydneyMidNightEpoch;
// console.log("currentServerDateTime", currentServerDateTime);
// console.log("currentSydneyDateTime", currentSydneyDateTime);
// console.log("currentSydneyMidNight", currentSydneyMidNight);
// console.log("currentSydneyMidNightEpoch", currentSydneyMidNightEpoch);
// console.log("startFromEpoch:", startFromEpoch);



var today = new Date();  // Returns UTC datetime
var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 1, 0);
var localoffset = -(today.getTimezoneOffset()/60);
var destoffset = 11; // GMT+11 for Sydney
var offset = destoffset-localoffset;
var offsetMidnightDateTime = new Date( todayMidnight.getTime() + offset * 3600 * 1000);
var offsetMidnightDateTimeEpoch = offsetMidnightDateTime.getTime()/1000;

console.log(
  "today (UTC)", today,
  "\ntodayMidnight", todayMidnight, 
  "\noffsetMidnightDateTime (Sydney GMT+11)", offsetMidnightDateTime,
  "\noffsetMidnightDateTimeEpoch", offsetMidnightDateTimeEpoch,
  );
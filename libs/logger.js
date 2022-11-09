const { createLogger, format, transports } = require("winston");
const {logLevel} = require("../libs/configloader");

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logger = createLogger({
  level: logLevel, // and above
  lavels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console()],
});

module.exports = { logger }

let test_logger = ()=>{
  logger.debug("Pissed debug");
  logger.info("Pissed info");
  logger.warn("Pissed warn");
  logger.error("Pissed error");
}

if(0) test_logger();

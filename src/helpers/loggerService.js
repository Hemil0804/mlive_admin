const winston = require("winston");

let myEnvDir;

if (process.env.NODE_ENV == "local") {
	myEnvDir = "local";
} else if (process.env.NODE_ENV == "production") {
	myEnvDir = "production";
} else {
	myEnvDir = "dev";
}

const allLogFilePath = `./logger/${myEnvDir}/all-logs.log`;
const exceptionsLogPath = `./logger/${myEnvDir}/exceptions.log`;

const logger = winston.createLogger({
	transports: [
		new winston.transports.File({
			level: "info",
			filename: allLogFilePath,
			handleExceptions: true,
			json: true,
			maxsize: 5242880, // 5MB
			maxFiles: 5, // if log file size is greater than 5MB, logfile2 is generated
			colorize: true,
		}),
		new winston.transports.Console({
			level: "debug",
			handleExceptions: true,
			json: false,
			colorize: true,
			timestamp: true,
		}),
	],
	exceptionHandlers: [
		new winston.transports.File({
			filename: exceptionsLogPath,
			timestamp: true,
			maxsize: 5242880,
			json: false,
			colorize: true,
		}),
	],
	exitOnError: false,
});

module.exports = {
	logger: logger
};
module.exports.stream = {
	write(message) {
		//logger.info(message);
	},
};

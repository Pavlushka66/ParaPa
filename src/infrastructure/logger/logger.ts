import appRoot from "app-root-path";
import * as winston from 'winston';

const logggerOptions = {
    file: {
        filename: `${appRoot}/logs/parser.log`,
        handleExceptions: true,
        json: false,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    },
    console: {
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger: winston.Logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.simple()
    ),
    level: 'info',
    transports: process.env.NODE_ENV === "production"
        ? [new winston.transports.File(logggerOptions.file),
        new winston.transports.Console(logggerOptions.console)]
        : [new winston.transports.Console(logggerOptions.console)],
    exitOnError: false, // do not exit on handled exceptions
});

export default logger;
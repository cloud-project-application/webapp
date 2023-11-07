const winston = require('winston');
const { combine, timestamp, printf, colorize, errors } = winston.format;
const WinstonCloudWatch = require('winston-cloudwatch');
require('dotenv').config();
 
// Define your custom format with printf.
const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});
 
// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Set the default minimum level to log. Change this to debug for more verbose logging
  format: combine(
    timestamp(), // Add timestamp to each log
    errors({ stack: true }), // Ensure to log the stack trace if available
    myFormat // Custom format for log string
  ),
  transports: [
    // Default transport is console. It outputs the logs to the console.
    new winston.transports.Console({ format: combine(colorize(), myFormat) }),
  ],
});
 
// In production, write to a file and to CloudWatch, in addition to the console.
console.log(process.env.NODE_ENV )
if (process.env.NODE_ENV === 'amienv') {
    // if ('production' === 'production') {
  console.log('adding in log')
  logger.add(new winston.transports.File({ filename: 'err.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'all.log' }));
 
  // Configure CloudWatch transport
 
  logger.add(new WinstonCloudWatch({
    logGroupName: 'webapplogger', // Replace with your log group
    logStreamName: 'loggingerr', // Replace with your log stream
    awsRegion: 'us-east-1', // Replace with your AWS region
    // awsAccessKeyId: keyId, // Set in your environment variables
    // awsSecretKey: key, // Set in your environment variables
    // awsSessionToken is optional and only necessary if you are using temporary credentials obtained via STS
    // awsSessionToken: process.env.AWS_SESSION_TOKEN, // Set in your environment variables if using temporary credentials
    jsonMessage: true
  }));
 
  logger.add(new WinstonCloudWatch({
    logGroupName: 'webapplogger',
    logStreamName: 'loggingall', // Use your specific log stream name for combined logs
    awsRegion: 'us-east-1', // Ensure AWS_REGION is set in your environment variables
    jsonMessage: true
  }));
 
}
 
module.exports = logging;
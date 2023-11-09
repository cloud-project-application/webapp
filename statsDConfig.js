const StatsD = require("node-statsd");
const statsd = new StatsD({
  port: 8125, // Specify the StatsD port
});
 
const incrementAPIMetric = async (apiName,httpMethod) => {
  try {
    // Increment a StatsD counter
    // statsd.increment(`api.${apiName}.calls`);
    statsd.increment(`api.${apiName}.${httpMethod}.calls`);
    console.log(`apiName: ${apiName}`);
    console.log(`httpMethod: ${httpMethod}`);
    console.log("statsd configured!");
  } catch (error) {
    console.error("Error updating custom metric:", error);
  }
};
module.exports = incrementAPIMetric;
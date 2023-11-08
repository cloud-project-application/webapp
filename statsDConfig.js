const StatsD = require("node-statsd");
const statsd = new StatsD({
  host: "", // Specify the StatsD server address
  port: 8125, // Specify the StatsD port
});
 
const incrementAPIMetric = async (apiName) => {
  try {
    // Increment a StatsD counter
    // statsd.increment(`api.${apiName}.calls`);
    statsd.increment(`api.${apiName}.${httpMethod}.calls`);
  } catch (error) {
    console.error("Error updating custom metric:", error);
  }
};
module.exports = incrementAPIMetric;
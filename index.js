#!/usr/bin/node
if (process.env.NODE_ENV !== "amienv") {
  require("dotenv").config();
}

// require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logging = require('./logging'); 
const bootstrapDatabase = require('./app/utils/bootstrapDatabase');
const assignmentRoutes = require('./app/routes/assignmentRoutes');
const authRoutes = require('./app/routes/authenticationRoutes');
const {sequelize} = require('./app/utils/database');
const incrementAPIMetric = require("./statsDConfig");
const { authenticateToken } = require('./app/middleware/authentication'); // Require the middleware

const app = express();
const port = 3000;

app.use(bodyParser.json());

// // Load user data from CSV and create users
bootstrapDatabase();

const checkForQueryParams = (req, res, next) => {
  if (Object.keys(req.query).length > 0) {
    incrementAPIMetric("/healthz", "GET");
    logging.info('Bad Request with params');
    return res.status(400).json();
  }
  next(); // Continue processing the request
};
const checkForBody = (req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    incrementAPIMetric("/healthz", "GET");
    logging.info('Bad Request with Body');
    return res.status(400).json();
  }
  next(); // Continue processing the request
};


// Healthz Endpoint
app.get('/healthz',checkForQueryParams, checkForBody, (req, res) => {
  if (Object.keys(req.query).length > 0) {
    incrementAPIMetric("/healthz", "GET");
    logging.info('Bad Request');
    res.status(400).header('Cache-Control', 'no-cache').send();
    return;
  }
  sequelize
    .authenticate()
    .then(() => {
      // 200 OK if the database connection is successful
      incrementAPIMetric("/healthz", "GET");
      res.status(200).header('Cache-Control', 'no-cache').end();
      logging.info('Database is connecteddddd');
    })
    .catch((err) => {
      // 503 Service Unavailable if there is an error connecting to the database
      console.error('Database connection error:', err);
      incrementAPIMetric("/healthz", "GET");
      res.status(503).header('Cache-Control', 'no-cache').end();
      logging.info('Database is connection failed');
    });
});
app.use('/healthz', (req, res) => {
  sequelize
    .authenticate()
    .then(() => {
      // 200 OK if the database connection is successful
      incrementAPIMetric("/healthz", "PATCH");
      res.status(405).header('Cache-Control', 'no-cache').end();
      logging.info('Database is connection failed 405');
    })
    .catch((err) => {
      // 503 Service Unavailable if there is an error connecting to the database
      console.error('Database connection error:', err);
      incrementAPIMetric("/healthz", "PATCH");
      res.status(503).header('Cache-Control', 'no-cache').end();
      logging.info('Database is connection failed');
    });
});

// Apply the authentication middleware to routes that require authentication

app.use('/demo/assignments', authenticateToken, assignmentRoutes);
app.use('/demo/assignments', (req, res) => {
  sequelize
    .authenticate()
    .then(() => {
      // 200 OK if the database connection is successful
      incrementAPIMetric("/demo/assignments", "PATCH");
      res.status(405).header('Cache-Control', 'no-cache').end();
      logging.info('405 method not found');
    })
    .catch((err) => {
      // 503 Service Unavailable if there is an error connecting to the database
      console.error('Database connection error:', err);
      incrementAPIMetric("/demo/assignments", "GET");
      res.status(503).header('Cache-Control', 'no-cache').end();
      logging.info('Database is connection failed');
    });
});


// Define API routes
app.use('/auth',checkForQueryParams, authRoutes);
app.use('/auth', (req, res) => {
  sequelize
    .authenticate()
    .then(() => {
      // 200 OK if the database connection is successful
      res.status(405).header('Cache-Control', 'no-cache').end();
    })
    .catch((err) => {
      // 503 Service Unavailable if there is an error connecting to the database
      console.error('Database connection error:', err);
      res.status(503).header('Cache-Control', 'no-cache').end();
    });
});


app.use((req, res) => {
  res.status(404).json();
  logging.info('404 Not Available');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = {app};
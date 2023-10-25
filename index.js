#!/usr/bin/node
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bootstrapDatabase = require('./app/utils/bootstrapDatabase');
const assignmentRoutes = require('./app/routes/assignmentRoutes');
const authRoutes = require('./app/routes/authenticationRoutes');
const {sequelize} = require('./app/utils/database');
const { authenticateToken } = require('./app/middleware/authentication'); // Require the middleware

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// // Load user data from CSV and create users
bootstrapDatabase();

const checkForQueryParams = (req, res, next) => {
  if (Object.keys(req.query).length > 0) {
    return res.status(400).json();
  }
  next(); // Continue processing the request
};
const checkForBody = (req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    return res.status(400).json();
  }
  next(); // Continue processing the request
};


// Healthz Endpoint
app.get('/healthz',checkForQueryParams, checkForBody, (req, res) => {
  if (Object.keys(req.query).length > 0) {
    res.status(400).header('Cache-Control', 'no-cache').send();
    return;
  }
  sequelize
    .authenticate()
    .then(() => {
      // 200 OK if the database connection is successful
      res.status(200).header('Cache-Control', 'no-cache').end();
    })
    .catch((err) => {
      // 503 Service Unavailable if there is an error connecting to the database
      console.error('Database connection error:', err);
      res.status(503).header('Cache-Control', 'no-cache').end();
    });
});
app.use('/healthz', (req, res) => {
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

// Apply the authentication middleware to routes that require authentication

app.use('/v1/assignments', authenticateToken, assignmentRoutes);
app.use('/v1/assignments', (req, res) => {
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
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = {app};
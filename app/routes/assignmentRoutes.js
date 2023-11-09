// /app/routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authentication');
const {
  createAssignment,
  getAllAssignments,
  getAssignmentDetails,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController');
const logging = require('../../logging');
console.log("here");

const checkForBody = (req, res, next) => {
  if (Object.keys(req.body).length > 0) {
    logging.info('Bad request for Body');
    return res.status(400).json();
  }
  next(); // Continue processing the request
};
const checkForQueryParams = (req, res, next) => {
  if (Object.keys(req.query).length > 0) {
    logging.info('Bad request for Parameter');
    return res.status(400).json();
  }
  next(); // Continue processing the request
};
// Create Assignment - POST /v1/assignments
router.post('/', checkForQueryParams, createAssignment);

// Get All Assignments - GET /v1/assignments
router.get('/', checkForQueryParams, checkForBody, getAllAssignments);

// Get Assignment Details - GET /v1/assignments/:id
router.get('/:id',checkForQueryParams,checkForBody, getAssignmentDetails);

// Update Assignment - PUT /v1/assignments/:id
router.put('/:id',checkForQueryParams, updateAssignment);

// Delete Assignment - DELETE /v1/assignments/:id
router.delete('/:id', checkForQueryParams, checkForBody, deleteAssignment);

module.exports = router;

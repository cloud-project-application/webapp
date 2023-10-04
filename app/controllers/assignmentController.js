const { Assignment } = require('../utils/database');
const jwt = require('jsonwebtoken');


// Middleware to check if the user has authorization
async function isAuthorized(req, res, next,id) {
  const user = req.user;
  console.log(user,"user---------");
  try {
    const assignment = await Assignment.findByPk(id);
    console.log(assignment,"assignment");
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    console.log(assignment.UserId ,"assignment.UserId ");
    console.log(user.id,"user.id");
    if (user && assignment.UserId == user.id) {
      return assignment; // Return the assignment for further processing
    } else {
      res.status(401).json({ message: 'Forbidden' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function createAssignment(req, res) {
  try{
    const { name, points, num_of_attempts, deadline } = req.body;
    const user = req.user;
    console.log(req.body);
    console.log(user,"myuser-------------");
    if(user){
      const assignment = await Assignment.create({ 
        name:req.body.name, 
        points:req.body.points, 
        num_of_attempts:req.body.num_of_attempts, 
        deadline:req.body.deadline,
      });
      if(assignment){ 
        assignment.setUser(user); // Set the User association
        await assignment.save(); // Save the Assignment
        res.status(201).json(assignment);
      }
    }
    else{
      res.status(403).json();
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function updateAssignment(req, res, next) {


  const { id } = req.params;
  const { name, points, num_of_attempts, deadline } = req.body;
  const assignment = await isAuthorized(req, res, next,id); // Check authorization and get the assignment

  if (!assignment) {
    return; // Authorization failed, and the response has been handled in the isAuthorized middleware
  }

  try {
    if (assignment) {

      assignment.name = name;
      assignment.points = points;
      assignment.num_of_attempts = num_of_attempts;
      assignment.deadline = deadline;
      assignment.assignment_created = assignment.createdAt;
      assignment.assignment_updated = assignment.updatedAt;
      
      await assignment.save();

      res.status(200).json(assignment);
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function deleteAssignment(req, res,next) {
  const { id } = req.params;
  const assignment = await isAuthorized(req, res, next,id); // Check authorization and get the assignment

  if (!assignment) {
    return; // Authorization failed, and the response has been handled in the isAuthorized middleware
  }

  try {
    await assignment.destroy();

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function getAllAssignments(req, res) {
  try {
    const assignments = await Assignment.findAll();

    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function getAssignmentDetails(req, res) {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Bad Request' });
  }
}

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignmentDetails,
};

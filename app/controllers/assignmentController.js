const { Assignment, Submission, User } = require('../utils/database');
const jwt = require('jsonwebtoken');
const logging = require('../../logging'); 
const incrementAPIMetric = require("../../statsDConfig");
if (process.env.NODE_ENV !== "amienv") {
  require("dotenv").config();
}
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' }); // replace YOUR_REGION with your region
const sns = new AWS.SNS({ apiVersion: '2010-03-31' });
// const AdmZip = require('adm-zip');
// const axios = require('axios');

// Middleware to check if the user has authorization
async function isAuthorized(req, res, next,id) {
  const user = req.user;
  console.log(user,"user---------");
  try {
    const assignment = await Assignment.findByPk(id);
    console.log(assignment,"assignment");
    if (!assignment) {
      logging.info('Assignment not found');
      return res.status(404).json({ message: 'Assignment not found' });
    }
    console.log(assignment.UserId ,"assignment.UserId ");
    console.log(user.id,"user.id");
    if (user && assignment.UserId == user.id) {
      logging.info('Assignment found, user authorized to access the assignmnet');
      return assignment; // Return the assignment for further processing
    } else {
      logging.info('User is not authorized to perform the task');
      res.status(403).json({ message: 'Forbidden' });
    }
  } catch (error) {
    console.error(error);
    logging.info('Bad request');
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function submitAssignment(req, res, next) {
  const { id } = req.params;
  const { submission_url } = req.body;
  const user = req.user;
  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  console.log(req.body,"req----->");

  try {
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      logging.info('Assignment not found');
      incrementAPIMetric(`/v1/assignments/${id}/submission`, "POST");
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if the user is authorized to submit for this assignment
    if (user) {
      console.log("natt",assignment.num_of_attempts);
      console.log("userid",assignment.UserId);
      console.log("user.id",user.email);
      // Check if the submission is allowed based on the retries config
      // if (assignment.num_of_attempts > 1) {
        // Check if the assignment due date has passed
        const currentDate = new Date();
        const userSubmissions = await Submission.count({
          where: {
            assignment_id: assignment.id,
          },
          include: [
            {
              model: Assignment,
              where: { id: assignment.id , UserId: user.id}, // Match the assignment ID
              include: [
                {
                  model: User,
                  attributes: [], // Only include necessary attributes, or remove this line to include all
                },
                // Other includes for the Assignment model, if needed
              ],
            },
          ],
        });
        if (currentDate <= assignment.deadline) {
          
          console.log("asssubmission",userSubmissions);
          if (userSubmissions >= assignment.num_of_attempts) {
            logging.info('Submission rejected - Exceeded maximum retries');
            res.status(400).json({ message: 'Submission rejected - Exceeded maximum retries' });
          }
          // const zip = new AdmZip(submission_url);
          // try{
          // const response = await axios.get(submission_url, { responseType: 'arraybuffer' });
          
          //   const zip = new AdmZip(response.data);
          //   const zipEntries = zip.getEntries();
          //   if (zipEntries.length === 0) {
          //     logging.info('Submission rejected - Empty or invalid zip file');
          //     return res.status(400).json({ message: 'Submission rejected - Empty or invalid zip file' });
          //   }
          // }
          // catch(error){
          //   logging.info('Submission rejected - Empty or invalid zip file');
          //   return res.status(400).json({ message: 'Submission rejected - Empty or invalid zip file' });
          // }
          // Create a new submission
          const submission = await Submission.create({
            // id: uuidv4(),
            assignment_id: assignment.id,
            submission_url: submission_url,
            submission_date: new Date(),
            submission_updated: new Date(),
          });
          

          const snsMessage = {
            Subject: "New Assignment is Submitted",
            Message: submission.submission_url, 
            TopicArn: snsTopicArn,
            MessageAttributes: {
              userEmail: {
                DataType: "String",
                StringValue: user.email,
              }
            }
          }
          await sns.publish(snsMessage).promise();
          console.log("message published------>",snsMessage);
          logging.info('Submission accepted');
          incrementAPIMetric(`/v1/assignments/id/submission`, "POST");
          assignment.num_of_attempts -= 1;
          await assignment.save();
          res.status(201).json(submission);
        } else {
          logging.info('Submission rejected - Assignment deadline has passed');
          res.status(400).json({ message: 'Submission rejected - Assignment deadline has passed' });
        }
      // } else {
      //   logging.info('Submission rejected - Exceeded maximum retries');
      //   res.status(400).json({ message: 'Submission rejected - Exceeded maximum retries' });
      // }
    } else {
      logging.info('User is not authorized to submit for this assignment');
      res.status(403).json({ message: 'Forbidden' });
    }
  } catch (error) {
    console.error(error);
    logging.info('Bad request');
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
        logging.info('Assignment saved and created');
        incrementAPIMetric("/v1/assignments", "POST");
        res.status(201).json(assignment);
      }
    }
    else{
      incrementAPIMetric("/v1/assignments", "POST");
      logging.info('Forbidden');
      res.status(403).json();
    }
  } catch (error) {
    console.error(error);
    incrementAPIMetric("/v1/assignments", "POST");
    logging.info('Bad request');
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function updateAssignment(req, res, next) {


  const { id } = req.params;
  const { name, points, num_of_attempts, deadline } = req.body;
  const assignment = await isAuthorized(req, res, next,id); // Check authorization and get the assignment

  if (!assignment) {
    incrementAPIMetric("/v1/assignments/id", "PUT");
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
      logging.info('Assignmnet Updated');
      incrementAPIMetric("/v1/assignments/id", "PUT");
      res.status(204).json();
    }
  } catch (error) {
    console.error(error);
    logging.info('Bad request');
    incrementAPIMetric("/v1/assignments/id", "PUT");
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function deleteAssignment(req, res,next) {
  const { id } = req.params;
  const assignment = await isAuthorized(req, res, next,id); // Check authorization and get the assignment

  if (!assignment) {
    incrementAPIMetric("/v1/assignments/id", "DELETE");
    return; // Authorization failed, and the response has been handled in the isAuthorized middleware
  }

  try {
    await assignment.destroy();
    incrementAPIMetric("/v1/assignments/id", "DELETE");
    logging.info('Assignmnet deleted');
    res.status(204).end();
  } catch (error) {
    console.error(error);
    incrementAPIMetric("/v1/assignments/id", "DELETE");
    logging.info('Bad request');
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function getAllAssignments(req, res) {
  try {
    const assignments = await Assignment.findAll();
    incrementAPIMetric("/v1/assignments", "GET");
    logging.info('received all assignmnets');
    res.status(200).json(assignments);
  } catch (error) {
    console.error(error);
    incrementAPIMetric("/v1/assignments", "GET");
    logging.info('Bad request');
    res.status(400).json({ message: 'Bad Request' });
  }
}

async function getAssignmentDetails(req, res) {
  const { id } = req.params;

  try {
    const assignment = await Assignment.findByPk(id);

    if (!assignment) {
      logging.info('Assignment not found');
      incrementAPIMetric("/v1/assignments/id", "GET");
      return res.status(404).json({ message: 'Assignment not found' });
    }
    incrementAPIMetric("/v1/assignments/id", "GET");
    logging.info('Assignment found');
    res.status(200).json(assignment);
  } catch (error) {
    console.error(error);
    logging.info('Bad Request');
    incrementAPIMetric("/v1/assignments/id", "GET");
    res.status(400).json({ message: 'Bad Request' });
  }
}

module.exports = {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignmentDetails,
  submitAssignment,
};

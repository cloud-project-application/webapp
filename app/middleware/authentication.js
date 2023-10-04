const jwt = require('jsonwebtoken');
const auth = require('basic-auth');
const bcrypt = require('bcrypt');
const { User } = require('../utils/database'); 
function authToken(token) {
  try {
    // Verify the token and decode it to get user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Replace 'your-secret-key' with your actual secret key

    return decoded; // Return the user information
  } catch (error) {
    return null; // Return null if token is invalid
  }
}
async function authenticateToken(req, res, next) {

    const credentials = auth(req);

    if (!credentials) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

  try {
    // Find the user with the provided email (username)
    const user = await User.findOne({ where: { email: credentials.name } });
    console.log("myuser------------",user);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(credentials.pass, user.password);

    if (isPasswordValid) {
      req.user = user; // Attach user information to the request if needed
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = { authenticateToken };

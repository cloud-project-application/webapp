// Import necessary modules and models
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../utils/database'); // Import your User model

// Handle user authentication
async function loginUser(req, res) {
  console.log(req.body.email,"reqquesttt--------------");
  console.log(req.body.password,"reqquestpasst--------------");
  try {
    // Check if a user with the provided username exists
    let user = await User.findOne({ where: { email: req.body.email} });
    console.log(user,"user-------");
    if (!user) {
      // If the user does not exist, create a new user account
      const hashedPassword = bcrypt.hashSync(req.body.password, 10);
      user = await User.create({
        first_name:req.body.first_name,
        last_name:req.body.last_name,
        password: hashedPassword,
        email:req.body.email,
      });
      console.log("User Created");
    }

    // Authenticate the user by comparing the provided password with the stored hashed password
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    // Generate an authentication token for the user
    const token = jwt.sign({ user: user.email }, process.env.JWT_SECRET_KEY);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(400).json();
  }
}

module.exports = { loginUser };


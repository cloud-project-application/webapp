// /app/utils/database.js
const { Sequelize } = require('sequelize');
if (process.env.NODE_ENV !== "amienv") {
  require("dotenv").config();
}

// Create a Sequelize instance with database connection options
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
  host: process.env.HOST,
  dialect: 'mysql',
});

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  account_created: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  account_updated: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
},{
  hooks: {
    beforeValidate: function (user) {
      if (!user.account_created) {
        // Set assignment_created to createdAt if it's not already set
        user.account_created = user.createdAt;
      }

      if (!user.account_updated) {
        // Set assignment_updated to updatedAt if it's not already set
        user.account_updated = user.updatedAt;
      }
    },
  },
});

// Define the Assignment model
const Assignment = sequelize.define('Assignment', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  points: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  num_of_attempts: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100,
    },
  },
  deadline: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  assignment_created: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  assignment_updated: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
},{
  hooks: {
    beforeValidate: function (assignment) {
      if (!assignment.assignment_created) {
        // Set assignment_created to createdAt if it's not already set
        assignment.assignment_created = assignment.createdAt;
      }

      if (!assignment.assignment_updated) {
        // Set assignment_updated to updatedAt if it's not already set
        assignment.assignment_updated = assignment.updatedAt;
      }
    },
  },
});

// Set up associations
User.hasMany(Assignment);
Assignment.belongsTo(User);

// Sync models with the database
sequelize.sync()
  .then(() => {
    console.log('Database sync successful');
  })
  .catch((error) => {
    console.error('Database sync error:', error);
  });

module.exports = { sequelize, User, Assignment };

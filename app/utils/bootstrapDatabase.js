// /app/utils/bootstrap.js
const fs = require('fs');
const csv = require('csv-parser');

const { User } = require('./database');
const bcrypt = require('bcrypt');
const filePath = 'app/opt/user.csv';


async function bootstrapDatabase() {
  console.log(process.cwd());
  const csvData = [];
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', async () => {
      console.log('CSV file loaded.');
      try {
        const existingUsers = await User.findAll();
        // Process each row in the CSV and create users without checking for duplicates
        for (const row of csvData) {
          const existingUser = existingUsers.find(
            (user) => user.email === row.email
          );
          if (!existingUser) {
            // Hash the password before storing it in the database
            const hashedPassword = await bcrypt.hash(row.password, 10); // Use bcrypt to hash the password
            // Create a new user account if it doesn't exist
            await User.create({
              first_name: row.first_name,
              last_name: row.last_name,
              email: row.email,
              password: hashedPassword, // Store the hashed password
            });
          } 
          else {
            // User already exists, no action needed
            console.log(
              `User with email ${row.email} already exists. Skipping...`
            );
          }
        }
        console.log('User accounts loaded from CSV.');
      } catch (error) {
        console.log(error);
      }
    });
}

module.exports = bootstrapDatabase;

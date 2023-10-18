#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt -y upgrade

# Install Node.js, npm, MariaDB server, and client
sudo apt -y install nodejs npm mariadb-server mariadb-client

# Start and enable MariaDB
sudo systemctl start mariadb
sudo systemctl enable mariadb


# Setup database and user for your web app
# Remember to replace [YourRootPassword] and [YourDBName] accordingly.
sudo mysql -u root <<EOF
CREATE DATABASE healthCheck;
create user 'nishi'@'localhost' identified by 'Nishionmysql@123';
GRANT ALL PRIVILEGES ON healthCheck.* TO 'nishi'@'localhost';
FLUSH PRIVILEGES;
EOF

# You may further install and configure your web application below this line

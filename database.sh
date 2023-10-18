#!/bin/bash

# Update and upgrade the system
sudo apt update && sudo apt -y upgrade

# Install Node.js, npm, MariaDB server, and client
sudo apt -y install nodejs npm mariadb-server mariadb-client

# Start and enable MariaDB
sudo systemctl start mariadb
sudo systemctl enable mariadb

# # Secure the MariaDB installation
# # Note: In production, utilize a more secure way of handling MySQL root password 
# # such as using secret management tools or AWS Secrets Manager.
# sudo mysql_secure_installation <<EOF
# y
# [YourRootPassword]
# [YourRootPassword]
# y
# y
# y
# y
# EOF

# Setup database and user for your web app
# Remember to replace [YourRootPassword] and [YourDBName] accordingly.
sudo mysql -u root <<EOF
CREATE DATABASE healthCheck;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON healthCheck.* TO 'root'@'localhost' IDENTIFIED BY 'root';
FLUSH PRIVILEGES;
EOF

# You may further install and configure your web application below this line

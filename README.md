Steps for debain config:
ssh -i .ssh/digitalocean root@159.89.88.97
sudo apt install mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb

Database config:
mysql -u root -p
Create Database healthCheck;
create user 'nishi'@'localhost' identified by 'Nishionmysql@123';
GRANT ALL PRIVILEGES ON healthCheck.\* TO 'nishi'@'localhost';
FLUSH PRIVILEGES;

scp -i ~/.ssh/digitalocean -r ~/Downloads/webapp-assignment_03 root@159.89.88.97:~/Assignment03Test

Ls
Cd

Sudo apt install nodejs npm

http://159.89.88.97:3000/v1/assignments

    * Health Check:
        * Request Type: GET
        * URL: http://159.89.88.97:3000/healthz

    * Create Assignment (Authenticated):
        * Request Type: POST
        * URL: http://159.89.88.97:3000/v1/assignments
        * Request Body (JSON):json
        { "name": "Assignment 01", "points": 10, "num_of_attempts": 3, "deadline": "2016-08-29T09:12:33.001Z" }

    * Get All Assignments (Authenticated):
        * Request Type: GET
        * URL: http://159.89.88.97:3000/v1/assignments

    * Get Assignment Details (Authenticated):
        * Request Type: GET
        * URL: http://159.89.88.97:3000/v1/assignments/{assignment_id}

    * Update Assignment (Authenticated):
        * Request Type: PUT
        * URL: http://localhost:3000/v1/assignments/{assignment_id}
        * Request Body (JSON):json
        { "name": "Updated Assignment 01", "points": 15, "num_of_attemps": 5, "deadline": "2023-10-31T23:59:59.999Z" }

    * Delete Assignment (Authenticated):
        * Request Type: DELETE
        * URL: http://localhost:3000/v1/assignments/{assignment_id}

packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

locals {
  timestamp = regex_replace(timestamp(), "[- TZ:]", "")
}

variable "aws_profile" {
  type    = string
  default = "dev"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami_owner" {
  type    = string
  default = "644147995741"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

source "amazon-ebs" "webapp" {
  profile       = var.aws_profile
  ami_name      = "webapp-ami-${local.timestamp}"
  instance_type = var.instance_type
  region        = var.region

  source_ami   = "ami-06db4d78cb1d3bbf9"
  ssh_username = var.ssh_username
  ami_users    = ["261455965941"]
}


build {
  sources = ["source.amazon-ebs.webapp"]

  provisioner "shell" {
    inline = [
      "sudo apt update",
      "sudo apt -y upgrade",
      "sudo apt -y install nodejs npm mariadb-server mariadb-client",
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/home/admin/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get install unzip -y",
      "cd /home/admin",
      "unzip webapp.zip",
      "npm install",
      "yes | sudo adduser ec2-user",
      "yes | echo 'ec2-user:ec2-user1234' | sudo chpasswd",
      "yes | sudo usermod -aG ec2-user ec2-user",
      "sudo chmod +x /home/admin/index.js",
      "sudo setfacl -Rm u:ec2-user:rwx /home/admin",
      "sudo mv /home/admin/webapp.service /etc/systemd/system/",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable webapp",
      "echo 'Installing CloudWatch Agent'",
      "sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb",
      "sudo dpkg -i -E ./amazon-cloudwatch-agent.deb",
      "echo 'CloudWatch Agent Installed'",
      "sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/admin/amazon-cloudwatch-agent.json -s",
      "sudo systemctl enable amazon-cloudwatch-agent",
      "sudo systemctl start amazon-cloudwatch-agent",
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo apt clean",
      "sudo rm -rf /var/lib/apt/lists/*"
    ]
  }
}

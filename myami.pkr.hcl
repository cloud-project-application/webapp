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
  env_vars = jsondecode(file(".env.json"))
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
      "sudo systemctl start mariadb",
      "sudo systemctl enable mariadb",
      "sudo mysql -u ${local.env_vars.DB_USER} -p${local.env_vars.DB_PASSWORD} -e 'CREATE DATABASE ${local.env_vars.DB_NAME};'",
      "sudo mysql -u ${local.env_vars.DB_USER} 'ALTER USER 'root'@'localhost' IDENTIFIED BY '$NEW_PASSWORD';
      "sudo mysql  -u ${local.env_vars.DB_USER} -p${local.env_vars.DB_PASSWORD} -e \"GRANT ALL PRIVILEGES ON ${local.env_vars.DB_NAME}.* TO '${local.env_vars.DB_USER}'@'${local.env_vars.DB_HOST}' IDENTIFIED BY '${local.env_vars.DB_PASSWORD}';\"",
      "sudo mysql  -u ${local.env_vars.DB_USER} -p${local.env_vars.DB_PASSWORD} -e 'FLUSH PRIVILEGES;'"
    ]
  }

  provisioner "file" {
    source      = "webapp.zip"
    destination = "/home/admin/webapp.zip"
  }

  provisioner "shell" {
    inline = [
      "sudo apt-get install unzip",
      "cd /home/admin",
      "unzip webapp.zip",
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo apt clean",
      "sudo rm -rf /var/lib/apt/lists/*"
    ]
  }
}

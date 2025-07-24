pipeline {
  agent any

  environment {
    EC2_HOST = credentials('ec2-host')  // if stored as a Secret Text
  }

  stages {
    stage('Checkout Code') {
      steps {
        checkout scm
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(['ec2-ssh-key']) {
          bat """
          echo Connecting to EC2 and running deploy script...
          ssh -o StrictHostKeyChecking=no ubuntu@%ec2-host% "bash ~/task-manager-api/deploy1.sh"
          """
        }
      }
    }
  }
}

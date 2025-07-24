pipeline {
  agent any

  environment {
    EC2_HOST = credentials('ec2-host')
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'main', url: 'https://github.com/chitranjan08/task-manager-api.git'
      }
    }

    stage('Deploy to EC2') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'KEY_FILE')]) {
          bat """
          echo Connecting to EC2 and running deploy script...
          ssh -i -o "%KEY_FILE%" -o StrictHostKeyChecking=no ubuntu@%EC2_HOST% "bash ~/task-manager-api/deploy1.sh"
          """
        }
      }
    }
  }
}

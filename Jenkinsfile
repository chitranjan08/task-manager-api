pipeline {
  agent any

  environment {
    EC2_HOST = credentials('ec2-host') // We'll add this secret
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'main', url: 'https://github.com/chitranjan08/task-manager-api'
      }
    }

    stage('Deploy to EC2') {
      steps {
        sshagent(['ec2-ssh-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@$EC2_HOST 'bash ~/task-manager-api/deploy1.sh'
          '''
        }
      }
    }
  }
}

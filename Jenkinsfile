pipeline {
  agent any

  environment {
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test (Docker)') {
      steps {
        // Dockerfile'ı kullanarak imajı oluşturur (tester aşaması testleri çalıştırır)
        sh 'docker build --pull -t calculator .'
      }
    }

    stage('Show Images') {
      steps {
        sh 'docker images | grep calculator || true'
      }
    }
  }

  post {
    success {
      echo 'Pipeline başarılı — imaj oluşturuldu ve testler geçti.'
    }
    failure {
      echo 'Pipeline başarısız — loglara bak.'
      sh 'docker images | head -n 50 || true'
    }
  }
}

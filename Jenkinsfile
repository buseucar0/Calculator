pipeline {
  agent any

  environment {
    DOCKER_BUILDKIT = '0'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Test (Docker)') {
      steps {
        // Docker imajını build et (tester aşamasına kadar)
        sh 'docker build --target tester -t calculator-tester .'
      }
    }

    stage('Extract Test Results') {
      steps {
        // Test sonuçlarını konteynırdan kopyala
        sh '''
          docker rm -f calc-tester || true
          docker run --name calc-tester calculator-tester echo "ok"
          docker cp calc-tester:/app/test-results/test_results.xml .
          docker rm -f calc-tester
        '''
      }
    }

    stage('Build Final Image') {
      steps {
        sh 'docker build --target runner -t calculator .'
      }
    }
  }

  post {
    always {
      // JUnit plugin ile test raporunu yayınla
      junit 'test_results.xml'
    }
    success {
      echo 'Pipeline başarılı — testler geçti!'
    }
    failure {
      echo 'Pipeline başarısız — loglara bak!'
    }
  }
}
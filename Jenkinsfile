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
        sh 'docker build --target tester -t calculator-tester .'
      }
    }

    stage('Extract Reports') {
      steps {
        sh '''
          docker rm -f calc-tester || true
          docker run --name calc-tester calculator-tester echo "ok"
          docker cp calc-tester:/app/test-results/test_results.xml .
          docker cp calc-tester:/app/coverage/html ./coverage-report
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
      junit 'test_results.xml'

      publishHTML(target: [
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'coverage-report',
        reportFiles: 'index.html',
        reportName: 'Coverage Report'
      ])
    }
    success {
      echo 'Pipeline başarılı!'
    }
    failure {
      echo 'Pipeline başarısız!'
    }
  }
}
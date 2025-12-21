// js/presets.js - Pipeline templates

const presets = {
  'Simple Build': `
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Building...'
        sh 'npm install'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        echo 'Testing...'
        sh 'npm test'
      }
    }
    stage('Deploy') {
      steps {
        echo 'Deploying...'
        sh 'npm run deploy'
      }
    }
  }
}`,

  'Docker Build & Push': `
pipeline {
  agent any
  environment {
    DOCKER_REGISTRY = 'docker.io'
    IMAGE_NAME = 'myapp'
    IMAGE_TAG = 'latest'
  }
  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/user/repo.git'
      }
    }
    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG .'
      }
    }
    stage('Push to Registry') {
      steps {
        sh 'docker push $DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG'
      }
    }
  }
}`,

  'Parallel Testing': `
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        echo 'Building application...'
        sh 'mvn clean package'
      }
    }
    stage('Test') {
      parallel {
        stage('Unit Tests') {
          steps {
            sh 'mvn test'
          }
        }
        stage('Integration Tests') {
          steps {
            sh 'mvn verify'
          }
        }
        stage('Security Scan') {
          steps {
            sh 'npm audit'
          }
        }
      }
    }
    stage('Deploy') {
      steps {
        echo 'Deploying to production...'
      }
    }
  }
}`,

  'Kubernetes Deploy': `
pipeline {
  agent any
  environment {
    KUBECONFIG = '/home/jenkins/.kube/config'
    NAMESPACE = 'production'
  }
  stages {
    stage('Build') {
      steps {
        sh 'docker build -t myapp:\${BUILD_NUMBER} .'
      }
    }
    stage('Push Image') {
      steps {
        sh 'docker push myapp:\${BUILD_NUMBER}'
      }
    }
    stage('Deploy to K8s') {
      steps {
        sh 'kubectl apply -f deployment.yaml'
        sh 'kubectl set image deployment/myapp myapp=myapp:\${BUILD_NUMBER}'
        sh 'kubectl rollout status deployment/myapp'
      }
    }
    stage('Verify') {
      steps {
        sh 'kubectl get pods -n $NAMESPACE'
      }
    }
  }
  post {
    always {
      echo 'Deployment completed'
    }
  }
}`,

  'Multi-Branch Pipeline': `
pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
    stage('Test') {
      parallel {
        stage('Unit Tests') {
          steps {
            sh 'npm run test:unit'
          }
        }
        stage('E2E Tests') {
          steps {
            sh 'npm run test:e2e'
          }
        }
      }
    }
    stage('Deploy') {
      when {
        branch 'main'
      }
      steps {
        echo 'Deploying to production...'
        sh './deploy.sh production'
      }
    }
  }
}`,

  'Terraform Infrastructure': `
pipeline {
  agent any
  environment {
    AWS_REGION = 'us-east-1'
    TF_VAR_environment = 'production'
  }
  stages {
    stage('Terraform Init') {
      steps {
        sh 'terraform init'
      }
    }
    stage('Terraform Plan') {
      steps {
        sh 'terraform plan -out=tfplan'
      }
    }
    stage('Terraform Apply') {
      steps {
        input 'Apply Terraform changes?'
        sh 'terraform apply tfplan'
      }
    }
    stage('Verify Infrastructure') {
      steps {
        sh 'terraform output'
        sh 'aws ec2 describe-instances'
      }
    }
  }
  post {
    always {
      archiveArtifacts 'tfplan'
    }
  }
}`,

  'Microservices Deploy': `
pipeline {
  agent any
  stages {
    stage('Build Services') {
      parallel {
        stage('Auth Service') {
          steps {
            dir('auth-service') {
              sh 'docker build -t auth:latest .'
            }
          }
        }
        stage('API Service') {
          steps {
            dir('api-service') {
              sh 'docker build -t api:latest .'
            }
          }
        }
        stage('Frontend') {
          steps {
            dir('frontend') {
              sh 'npm run build'
              sh 'docker build -t frontend:latest .'
            }
          }
        }
      }
    }
    stage('Deploy All') {
      steps {
        sh 'docker-compose up -d'
      }
    }
    stage('Health Check') {
      steps {
        sh 'curl http://localhost:8080/health'
        sh 'curl http://localhost:3000/health'
      }
    }
  }
}`,

  'Python ML Pipeline': `
pipeline {
  agent any
  environment {
    PYTHON_VERSION = '3.9'
    MODEL_PATH = './models'
  }
  stages {
    stage('Setup') {
      steps {
        sh 'python -m venv venv'
        sh '. venv/bin/activate && pip install -r requirements.txt'
      }
    }
    stage('Data Processing') {
      steps {
        sh '. venv/bin/activate && python preprocess.py'
      }
    }
    stage('Train Model') {
      steps {
        sh '. venv/bin/activate && python train.py'
      }
    }
    stage('Evaluate') {
      steps {
        sh '. venv/bin/activate && python evaluate.py'
      }
    }
    stage('Deploy Model') {
      steps {
        sh 'cp $MODEL_PATH/model.pkl /opt/models/'
        sh 'systemctl restart ml-service'
      }
    }
  }
  post {
    always {
      archiveArtifacts 'models/**'
    }
  }
}`,

  'Mobile App CI/CD': `
pipeline {
  agent any
  environment {
    ANDROID_HOME = '/opt/android-sdk'
    FASTLANE_SKIP_UPDATE_CHECK = 'true'
  }
  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/user/mobile-app.git'
      }
    }
    stage('Install Dependencies') {
      steps {
        sh 'npm install'
        sh 'cd ios && pod install'
      }
    }
    stage('Build') {
      parallel {
        stage('Android Build') {
          steps {
            sh 'cd android && ./gradlew assembleRelease'
          }
        }
        stage('iOS Build') {
          steps {
            sh 'cd ios && fastlane build'
          }
        }
      }
    }
    stage('Test') {
      parallel {
        stage('Android Tests') {
          steps {
            sh 'cd android && ./gradlew test'
          }
        }
        stage('iOS Tests') {
          steps {
            sh 'cd ios && fastlane test'
          }
        }
      }
    }
    stage('Deploy') {
      steps {
        sh 'fastlane deploy'
      }
    }
  }
}`,

  'Database Migration': `
pipeline {
  agent any
  environment {
    DB_HOST = 'prod-db.example.com'
    DB_NAME = 'myapp'
  }
  stages {
    stage('Backup Database') {
      steps {
        sh 'pg_dump $DB_NAME > backup_$(date +%Y%m%d).sql'
      }
    }
    stage('Run Migrations') {
      steps {
        sh 'flyway migrate'
      }
    }
    stage('Verify Schema') {
      steps {
        sh 'flyway validate'
        sh 'psql -c "SELECT version FROM schema_version"'
      }
    }
    stage('Run Tests') {
      steps {
        sh 'npm run test:db'
      }
    }
  }
  post {
    failure {
      sh 'flyway repair'
      echo 'Migration failed - manual intervention required'
    }
    always {
      archiveArtifacts 'backup_*.sql'
    }
  }
}`,

  'Serverless Deploy': `
pipeline {
  agent any
  environment {
    AWS_REGION = 'us-east-1'
    STAGE = 'production'
  }
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
        sh 'npm install -g serverless'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Package') {
      steps {
        sh 'serverless package --stage $STAGE'
      }
    }
    stage('Deploy') {
      steps {
        sh 'serverless deploy --stage $STAGE'
      }
    }
    stage('Smoke Test') {
      steps {
        sh 'curl https://api.example.com/health'
      }
    }
  }
  post {
    always {
      sh 'serverless info --stage $STAGE'
    }
  }
}`,

  'Security Scanning': `
pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/user/repo.git'
      }
    }
    stage('Security Scans') {
      parallel {
        stage('SAST') {
          steps {
            sh 'sonar-scanner'
          }
        }
        stage('Dependency Check') {
          steps {
            sh 'npm audit'
            sh 'snyk test'
          }
        }
        stage('Container Scan') {
          steps {
            sh 'trivy image myapp:latest'
          }
        }
        stage('Secret Detection') {
          steps {
            sh 'gitleaks detect'
          }
        }
      }
    }
    stage('Generate Report') {
      steps {
        sh 'generate-security-report.sh'
      }
    }
  }
  post {
    always {
      publishHTML([reportDir: 'reports', reportFiles: 'security.html'])
    }
  }
}`
};

// Make presets available globally
window.presets = presets;

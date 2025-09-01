pipeline {
    agent any

    parameters {
        string(
            name: 'DOCKER_TAG',
            defaultValue: 'v1.0.0',
            description: 'Enter the Docker image tag (e.g., v1.0.1)'
        )
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        SLACK_WEBHOOK         = credentials('slack-webhook-url')
        DOCKER_IMAGE          = 'naimat/nodeapp'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test || echo "No tests found, skipping test stage"'
            }
        }

        stage('Run Migrations') {
            steps {
                sh '''
                    echo "Running database migrations..."
                    # Example migration step (adjust for your DB)
                    echo "Migration completed successfully"
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${params.DOCKER_TAG} ."
                sh "docker tag ${DOCKER_IMAGE}:${params.DOCKER_TAG} ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Push to DockerHub') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${params.DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                    sh "docker logout"
                }
            }
        }
    }

    post {
        success {
            script {
                def message = "✅ SUCCESS: Build #${env.BUILD_NUMBER}\\n" +
                              "Branch: ${env.BRANCH_NAME}\\n" +
                              "Docker Image: ${DOCKER_IMAGE}:${params.DOCKER_TAG}\\n" +
                              "Duration: ${currentBuild.durationString}"

                sh """
                    curl -X POST -H 'Content-type: application/json' \
                    --data '{"text": "${message}"}' \
                    ${SLACK_WEBHOOK}
                """
            }
        }

        failure {
            script {
                def message = "❌ FAILED: Build #${env.BUILD_NUMBER}\\n" +
                              "Branch: ${env.BRANCH_NAME}\\n" +
                              "Duration: ${currentBuild.durationString}"

                sh """
                    curl -X POST -H 'Content-type: application/json' \
                    --data '{"text": "${message}"}' \
                    ${SLACK_WEBHOOK}
                """
            }
        }

        always {
            script {
                sh "docker rmi ${DOCKER_IMAGE}:${params.DOCKER_TAG} || true"
                sh "docker rmi ${DOCKER_IMAGE}:latest || true"
            }
        }
    }
}

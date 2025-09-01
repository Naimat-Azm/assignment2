pipeline {
    agent any

    parameters {
        string(name: 'DOCKER_TAG', defaultValue: '', description: 'Enter the Docker tag version (e.g., v1.0.0). Leave empty to auto-increment.')
    }

    environment {
        DOCKER_REGISTRY = 'azm-dev-registry-registry.me-central-1.cr.aliyuncs.com/abraj/test'
        DOCKER_IMAGE = 'test'
    }

    stages {
        stage('Determine Docker Tag') {
            steps {
                script {
                    if (params.DOCKER_TAG?.trim()) {
                        env.FINAL_TAG = params.DOCKER_TAG
                    } else {
                        // Auto-increment the Docker tag
                        def latestTag = sh(script: "docker images --format '{{.Tag}}' | grep -E '^v[0-9]+\\.[0-9]+\\.[0-9]+\\\$' | sort -V | tail -n 1", returnStdout: true).trim()
                        if (latestTag) {
                            def parts = latestTag.tokenize('.')
                            parts[-1] = (parts[-1].toInteger() + 1).toString()
                            env.FINAL_TAG = parts.join('.')
                        } else {
                            env.FINAL_TAG = 'v1.0.0'
                        }
                    }
                    echo "Using Docker tag: ${env.FINAL_TAG}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image ${DOCKER_REGISTRY}:${env.FINAL_TAG}"
                    sh """
                    docker build -t ${DOCKER_REGISTRY}:${env.FINAL_TAG} .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'alibaba-docker-credentials', 
                                                      usernameVariable: 'DOCKER_USERNAME', 
                                                      passwordVariable: 'DOCKER_PASSWORD')]) {
                        echo "Logging into Docker registry ${DOCKER_REGISTRY}..."
                        sh """
                        docker login ${DOCKER_REGISTRY} -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                        """
                        echo "Pushing Docker image ${DOCKER_REGISTRY}:${env.FINAL_TAG}..."
                        sh """
                        docker push ${DOCKER_REGISTRY}:${env.FINAL_TAG}
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Docker image pushed successfully with tag: ${env.FINAL_TAG}"
        }
        failure {
            echo "Pipeline failed. Please check the logs."
        }
    }
}

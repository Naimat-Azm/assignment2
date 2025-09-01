pipeline {
    agent any

    parameters {
        string(name: 'DOCKER_TAG', defaultValue: '', description: 'Docker tag (e.g., v1.0.0). Leave empty to auto-increment.')
    }

    environment {
        REGISTRY_URL = 'azm-dev-registry-registry.me-central-1.cr.aliyuncs.com'
        REPO_NAME = 'abraj/test'
        REGISTRY_USERNAME = '3206bdf57b644e109e8ac37cd76d50721756728433405@5934949054139199'
        DOCKER_CREDENTIALS_ID = 'alibaba-docker-credentials' // Replace with your Jenkins credentials ID
    }

    stages {
        stage('Determine Docker Tag') {
            steps {
                script {
                    if (params.DOCKER_TAG?.trim()) {
                        env.FINAL_TAG = params.DOCKER_TAG
                    } else {
                        // Fetch the latest tag from the registry
                        def latestTag = sh(script: "docker images --format '{{.Tag}}' | grep -E '^v[0-9]+\\.[0-9]+\\.[0-9]+$' | sort -V | tail -n 1", returnStdout: true).trim()
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

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh """
                        docker login --username=${USERNAME} --password=${PASSWORD} ${env.REGISTRY_URL}
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t ${env.REGISTRY_URL}/${env.REPO_NAME}:${env.FINAL_TAG} .
                """
            }
        }

        stage('Push Docker Image') {
            steps {
                sh """
                    docker push ${env.REGISTRY_URL}/${env.REPO_NAME}:${env.FINAL_TAG}
                """
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
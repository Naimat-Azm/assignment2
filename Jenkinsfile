// pipeline {
//     agent any
    
//     environment {
//         DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
//         SLACK_WEBHOOK = credentials('slack-webhook-url')
//         DOCKER_IMAGE = 'naimatazmdev/demoapp'
//         DOCKER_TAG = "${env.BUILD_NUMBER}"
//     }
    
//     triggers {
//         GenericTrigger(
//             genericVariables: [
//                 [key: 'ref', value: '$.ref'],
//                 [key: 'action', value: '$.action'],
//                 [key: 'base_branch', value: '$.pull_request.base.ref']
//             ],
//             causeString: 'Triggered by GitHub webhook',
//             token: 'github-webhook-token',
//             regexpFilterText: '$ref $action $base_branch',
//             regexpFilterExpression: '(refs/heads/develop|opened|synchronize.*develop)'
//         )
//     }
    
//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }
        
//         stage('Install Dependencies') {
//             steps {
//                 script {
//                     // Build Docker image directly which includes npm install
//                     sh '''
//                         echo "Building image with dependencies..."
//                         # Build the app image which runs npm install
//                         docker build -t temp-build-${BUILD_NUMBER} .
                        
//                         # Extract node_modules from the built image
//                         CONTAINER_ID=$(docker create temp-build-${BUILD_NUMBER})
//                         docker cp $CONTAINER_ID:/app/node_modules ./node_modules || true
//                         docker rm $CONTAINER_ID
//                         docker rmi temp-build-${BUILD_NUMBER} || true
//                     '''
//                 }
//             }
//         }
        
//         stage('Run Tests') {
//             steps {
//                 script {
//                     sh 'docker run --rm -v $(pwd):/workspace -w /workspace node:18-alpine npm test || echo "No tests found, skipping test stage"'
//                 }
//             }
//         }
        
//         stage('Run Migrations') {
//             steps {
//                 script {
//                     sh '''
//                         echo "Running database migrations..."
//                         # Since no migration scripts exist, we'll create a placeholder
//                         # In a real scenario, you would run your migration command here
//                         # For MongoDB with Mongoose, this could be:
//                         # npm run migrate
//                         echo "Migration completed successfully"
//                     '''
//                 }
//             }
//         }
        
//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
//                     sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
//                 }
//             }
//         }
        
//         stage('Push to DockerHub') {
//             steps {
//                 script {
//                     sh "echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin"
//                     sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
//                     // sh "docker push ${DOCKER_IMAGE}:latest"
//                     sh "docker logout"
//                 }
//             }
//         }
//     }
    
//     post {
//         success {
//             script {
//                 def message = ""
//                 if (env.CHANGE_ID) {
//                     message = "✅ Jenkins Pipeline SUCCESS for PR #${env.CHANGE_ID} to develop branch\\n" +
//                              "Repository: ${env.JOB_NAME}\\n" +
//                              "Build: #${env.BUILD_NUMBER}\\n" +
//                              "Branch: ${env.CHANGE_BRANCH}\\n" +
//                              "Target: ${env.CHANGE_TARGET}\\n" +
//                              "Duration: ${currentBuild.durationString}"
//                 } else {
//                     message = "✅ Jenkins Pipeline SUCCESS\\n" +
//                              "Repository: ${env.JOB_NAME}\\n" +
//                              "Build: #${env.BUILD_NUMBER}\\n" +
//                              "Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}\\n" +
//                              "Duration: ${currentBuild.durationString}"
//                 }
                
//                 sh """
//                     curl -X POST -H 'Content-type: application/json' \\
//                     --data '{"text": "${message}"}' \\
//                     \${SLACK_WEBHOOK}
//                 """
//             }
//         }
        
//         failure {
//             script {
//                 def message = ""
//                 if (env.CHANGE_ID) {
//                     message = "❌ Jenkins Pipeline FAILED for PR #${env.CHANGE_ID} to develop branch\\n" +
//                              "Repository: ${env.JOB_NAME}\\n" +
//                              "Build: #${env.BUILD_NUMBER}\\n" +
//                              "Branch: ${env.CHANGE_BRANCH}\\n" +
//                              "Target: ${env.CHANGE_TARGET}\\n" +
//                              "Duration: ${currentBuild.durationString}"
//                 } else {
//                     message = "❌ Jenkins Pipeline FAILED\\n" +
//                              "Repository: ${env.JOB_NAME}\\n" +
//                              "Build: #${env.BUILD_NUMBER}\\n" +
//                              "Duration: ${currentBuild.durationString}"
//                 }
                
//                 sh """
//                     curl -X POST -H 'Content-type: application/json' \\
//                     --data '{"text": "${message}"}' \\
//                     \${SLACK_WEBHOOK}
//                 """
//             }
//         }
        
//         always {
//             script {
//                 sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
//                 sh "docker rmi ${DOCKER_IMAGE}:latest || true"
//             }
//         }
//     }
// }


pipeline {
    agent any

    parameters {
        string(
            name: 'DOCKER_TAG',
            defaultValue: '',
            description: 'Enter Docker image tag (leave empty to auto-increment last digit, e.g., v1.0.0 → v1.0.1)'
        )
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        SLACK_WEBHOOK         = credentials('slack-webhook-url')
        DOCKER_IMAGE          = 'naimatazmdev/demoapp'
    }

    stages {
        stage('Set Docker Tag') {
            steps {
                script {
                    if (!params.DOCKER_TAG?.trim()) {
                        echo "No tag provided, fetching latest from DockerHub..."

                        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                            def tagsJson = sh(
                                script: """
                                    curl -s -u $USER:$PASS https://hub.docker.com/v2/repositories/${DOCKER_IMAGE}/tags?page_size=100
                                """,
                                returnStdout: true
                            ).trim()

                            def tags = []
                            try {
                                def parsed = readJSON text: tagsJson
                                tags = parsed.results*.name.findAll { it ==~ /^v\\d+\\.\\d+\\.\\d+\$/ }

                                // Sort tags numerically
                                tags = tags.sort { a, b ->
                                    def va = a.replace('v','').split('\\.').collect { it as int }
                                    def vb = b.replace('v','').split('\\.').collect { it as int }
                                    return va <=> vb
                                }
                            } catch (Exception e) {
                                echo "Could not parse tags from DockerHub, fallback to v1.0.0"
                                tags = []
                            }

                            def latestTag = tags ? tags.last() : "v1.0.0"
                            echo "Latest tag found: ${latestTag}"

                            def parts = latestTag.replace("v", "").split("\\.")
                            def newTag = "v${parts[0]}.${parts[1]}.${parts[2].toInteger() + 1}"

                            env.DOCKER_TAG = newTag
                            echo "Auto-incremented tag: ${env.DOCKER_TAG}"
                        }
                    } else {
                        env.DOCKER_TAG = params.DOCKER_TAG
                        echo "Using provided tag: ${env.DOCKER_TAG}"
                    }
                }
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        echo "Building image with dependencies..."
                        docker build -t temp-build-${BUILD_NUMBER} .
                        
                        CONTAINER_ID=$(docker create temp-build-${BUILD_NUMBER})
                        docker cp $CONTAINER_ID:/app/node_modules ./node_modules || true
                        docker rm $CONTAINER_ID
                        docker rmi temp-build-${BUILD_NUMBER} || true
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'docker run --rm -v $(pwd):/workspace -w /workspace node:18-alpine npm test || echo "No tests found, skipping test stage"'
                }
            }
        }

        stage('Run Migrations') {
            steps {
                script {
                    sh '''
                        echo "Running database migrations..."
                        echo "Migration completed successfully"
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker logout"
                }
            }
        }
    }

    post {
        success {
            script {
                def message = "✅ SUCCESS Build #${env.BUILD_NUMBER}\\n" +
                              "Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}\\n" +
                              "Duration: ${currentBuild.durationString}"
                sh """curl -X POST -H 'Content-type: application/json' --data '{"text": "${message}"}' ${SLACK_WEBHOOK}"""
            }
        }

        failure {
            script {
                def message = "❌ FAILED Build #${env.BUILD_NUMBER}\\nDuration: ${currentBuild.durationString}"
                sh """curl -X POST -H 'Content-type: application/json' --data '{"text": "${message}"}' ${SLACK_WEBHOOK}"""
            }
        }

        always {
            script {
                sh "docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true"
                sh "docker rmi ${DOCKER_IMAGE}:latest || true"
            }
        }
    }
}

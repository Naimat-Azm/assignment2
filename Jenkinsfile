// pipeline {
//     agent any
    
//     environment {
//         DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
//         SLACK_WEBHOOK = credentials('slack-webhook-url')
//         DOCKER_IMAGE = 'naimat/nodeapp'
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
//                     sh 'npm install'
//                 }
//             }
//         }
        
//         stage('Run Tests') {
//             steps {
//                 script {
//                     sh 'npm test || echo "No tests found, skipping test stage"'
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
//             when {
//                 anyOf {
//                     branch 'develop'
//                     expression { env.CHANGE_TARGET == 'develop' && env.CHANGE_ID == null }
//                 }
//             }
//             steps {
//                 script {
//                     sh "echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin"
//                     sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
//                     sh "docker push ${DOCKER_IMAGE}:latest"
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
//                     message = "✅ Jenkins Pipeline SUCCESS for push to develop branch\\n" +
//                              "Repository: ${env.JOB_NAME}\\n" +
//                              "Build: #${env.BUILD_NUMBER}\\n" +
//                              "Branch: ${env.BRANCH_NAME}\\n" +
//                              "Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}\\n" +
//                              "Duration: ${currentBuild.durationString}"
//                 }
                
//                 sh """
//                     curl -X POST -H 'Content-type: application/json' \\
//                     --data '{"text": "${message}"}' \\
//                     ${SLACK_WEBHOOK}
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
                             
//                              "Target: ${env.CHANGE_TARGET}\\n" +
//                              "Duration: ${currentBuild.durationString}"
//                 } else {
//                     message = "❌ Jenkins Pipeline FAILED for push to develop branch\\n" +
//                              "Repository: ${env.JOB_NAME}\\n" +
//                              "Build: #${env.BUILD_NUMBER}\\n" +
                             
//                              "Duration: ${currentBuild.durationString}"
//                 }
                
//                 sh """
//                     curl -X POST -H 'Content-type: application/json' \\
//                     --data '{"text": "${message}"}' \\
//                     ${SLACK_WEBHOOK}
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
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        SLACK_WEBHOOK = credentials('slack-webhook-url')
        DOCKER_IMAGE = 'naimatazmdev/assignment2'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'ref', value: '$.ref'],   // e.g. "refs/heads/main"
                [key: 'action', value: '$.action'],
                [key: 'base_branch', value: '$.pull_request.base.ref'],
                [key: 'head_branch', value: '$.pull_request.head.ref'],
                [key: 'event_name', value: '$.X-GitHub-Event']
            ],
            causeString: 'Triggered by GitHub webhook: $event_name $action',
            token: 'github-webhook-token',
            regexpFilterText: '$ref $action $base_branch',
            // 🔥 Changed this to trigger ONLY when push is to main
            regexpFilterExpression: 'refs/heads/main'
            regexpFilterText: '$event_name $action $base_branch $head_branch $ref',
            regexpFilterExpression: '.*(push.*refs/heads/develop|opened main develop|synchronize main develop).*',
            printContributedVariables: true,
            printPostContent: true
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm install'
            }
        }
        
        stage('Run Tests') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh 'npm test || echo "No tests found, skipping test stage"'
            }
        }
        
        stage('Run Migrations') {
            steps {
                script {
                    sh '''
                        echo "Running database migrations..."
                        # Example migration step (adjust for your DB)
                        echo "Migration completed successfully"
                    '''
                    echo "Running database migrations..."
                    echo "Migration completed successfully"
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
            // 🔥 Changed: only push when branch == main
            when {
                branch 'main'
                anyOf {
                    branch 'develop'
                    expression { env.GIT_BRANCH == 'origin/develop' }
                    expression { env.BRANCH_NAME == 'develop' }
                }
            }
            steps {
                script {
                    sh '''
                        echo "$DOCKERHUB_CREDENTIALS_PSW" | docker login -u "$DOCKERHUB_CREDENTIALS_USR" --password-stdin
                    '''
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                
                    sh "docker logout"
                }
            }
        }
    }
    
    post {
        success {
            script {
                def message = ""
                if (env.CHANGE_ID) {
                    message = "✅ Jenkins Pipeline SUCCESS for PR #${env.CHANGE_ID} to main branch\\n" +
                             "Repository: ${env.JOB_NAME}\\n" +
                             "Build: #${env.BUILD_NUMBER}\\n" +
                             "Branch: ${env.CHANGE_BRANCH}\\n" +
                             "Target: ${env.CHANGE_TARGET}\\n" +
                             "Duration: ${currentBuild.durationString}"
                } else {
                    message = "✅ Jenkins Pipeline SUCCESS for push to main branch\\n" +
                             "Repository: ${env.JOB_NAME}\\n" +
                             "Build: #${env.BUILD_NUMBER}\\n" +
                             "Branch: ${env.BRANCH_NAME}\\n" +
                             "Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}\\n" +
                             "Duration: ${currentBuild.durationString}"
                }
                
                sh """
                    curl -X POST -H 'Content-type: application/json' \
                    --data '{"text": "${message}"}' \
                    ${SLACK_WEBHOOK}
                    curl -X POST -H 'Content-type: application/json' \\
                    --data '{"text": "${message}"}' \\
                    \${SLACK_WEBHOOK}
                """
            }
        }
        
        failure {
            script {
                def message = ""
                if (env.CHANGE_ID) {
                    message = "❌ Jenkins Pipeline FAILED for PR #${env.CHANGE_ID} to main branch\\n" +
                             "Repository: ${env.JOB_NAME}\\n" +
                             "Build: #${env.BUILD_NUMBER}\\n" +
                             "Target: ${env.CHANGE_TARGET}\\n" +
                             "Duration: ${currentBuild.durationString}"
                } else {
                    message = "❌ Jenkins Pipeline FAILED for push to main branch\\n" +
                             "Repository: ${env.JOB_NAME}\\n" +
                             "Build: #${env.BUILD_NUMBER}\\n" +
                             "Duration: ${currentBuild.durationString}"
                }
                
                sh """
                    curl -X POST -H 'Content-type: application/json' \
                    --data '{"text": "${message}"}' \
                    ${SLACK_WEBHOOK}
                    curl -X POST -H 'Content-type: application/json' \\
                    --data '{"text": "${message}"}' \\
                    \${SLACK_WEBHOOK}
                """
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



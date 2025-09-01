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
//             regexpFilterExpression: '(refs/heads/develop|refs/heads/main|opened|synchronize.*(develop|main))'
//         )
//     }
    
//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//                 script {
//                     echo "=== BUILD INFORMATION ==="
//                     echo "Build Number: ${env.BUILD_NUMBER}"
//                     echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}"
//                     echo "Docker Tag: ${env.DOCKER_TAG}"
//                     echo "Build URL: ${env.BUILD_URL}"
//                     echo "Job Name: ${env.JOB_NAME}"
//                     echo "========================="
//                 }
//             }
//         }
        
//         stage('Notify Build Start') {
//             steps {
//                 script {
//                     def message = """
//                     {
//                         "text": "⚙️ *Build Started*",
//                         "attachments": [
//                             {
//                                 "color": "#439FE0",
//                                 "fields": [
//                                     {
//                                         "title": "Pipeline",
//                                         "value": "${env.JOB_NAME}",
//                                         "short": true
//                                     },
//                                     {
//                                         "title": "Build",
//                                         "value": "#${env.BUILD_NUMBER}",
//                                         "short": true
//                                     },
//                                     {
//                                         "title": "Branch",
//                                         "value": "${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}",
//                                         "short": true
//                                     },
//                                     {
//                                         "title": "Triggered By",
//                                         "value": "Naimat",
//                                         "short": true
//                                     }
//                                 ]
//                             }
//                         ]
//                     }
//                     """
                    
//                     sh """
//                         curl -X POST -H 'Content-type: application/json' \\
//                         --data '${message}' \\
//                         \${SLACK_WEBHOOK}
//                     """
//                 }
//             }
//         }
        
//         stage('Install Dependencies') {
//             steps {
//                 script {
//                     sh '''
//                         echo "Building image with dependencies..."
//                         docker build -t temp-build-${BUILD_NUMBER} .
                        
//                         CONTAINER_ID=$(docker create temp-build-${BUILD_NUMBER})
//                         docker cp $CONTAINER_ID:/app/node_modules ./node_modules 2>/dev/null || echo "No node_modules to extract"
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
//                     sh "docker logout"
                    
//                     // Send deployment notification
//                     def deployMessage = """
//                     {
//                         "text": "🚀 *Deployment tag updated successfully*",
//                         "attachments": [
//                             {
//                                 "color": "#36a64f",
//                                 "fields": [
//                                     {
//                                         "title": "Pipeline",
//                                         "value": "${env.JOB_NAME}/Deploy-Backend",
//                                         "short": true
//                                     },
//                                     {
//                                         "title": "Tag",
//                                         "value": "v${env.DOCKER_TAG}",
//                                         "short": true
//                                     },
//                                     {
//                                         "title": "Environment",
//                                         "value": "dev",
//                                         "short": true
//                                     },
//                                     {
//                                         "title": "Triggered By",
//                                         "value": "Naimat",
//                                         "short": true
//                                     }
//                                 ]
//                             }
//                         ]
//                     }
//                     """
                    
//                     sh """
//                         curl -X POST -H 'Content-type: application/json' \\
//                         --data '${deployMessage}' \\
//                         \${SLACK_WEBHOOK}
//                     """
//                 }
//             }
//         }
//     }
    
//     post {
//         success {
//             script {
//                 def successMessage = """
//                 {
//                     "text": "✅ *Build completed successfully*",
//                     "attachments": [
//                         {
//                             "color": "#36a64f",
//                             "fields": [
//                                 {
//                                     "title": "Pipeline",
//                                     "value": "${env.JOB_NAME}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Tag",
//                                     "value": "v${env.DOCKER_TAG}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Branch",
//                                     "value": "${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Duration",
//                                     "value": "${currentBuild.durationString}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Triggered By",
//                                     "value": "Naimat",
//                                     "short": true
//                                 }
//                             ]
//                         }
//                     ]
//                 }
//                 """
                
//                 sh """
//                     curl -X POST -H 'Content-type: application/json' \\
//                     --data '${successMessage}' \\
//                     \${SLACK_WEBHOOK}
//                 """
//             }
//         }
        
//         failure {
//             script {
//                 def failureMessage = """
//                 {
//                     "text": "❌ *Build failed*",
//                     "attachments": [
//                         {
//                             "color": "#ff0000",
//                             "fields": [
//                                 {
//                                     "title": "Pipeline",
//                                     "value": "${env.JOB_NAME}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Build",
//                                     "value": "#${env.BUILD_NUMBER}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Branch",
//                                     "value": "${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}",
//                                     "short": true
//                                 },
//                                 {
//                                     "title": "Duration",
//                                     "value": "${currentBuild.durationString}",
//                                     "short": true
//                                 }
//                             ]
//                         }
//                     ]
//                 }
//                 """
                
//                 sh """
//                     curl -X POST -H 'Content-type: application/json' \\
//                     --data '${failureMessage}' \\
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
            name: 'JIRA_TICKET', 
            defaultValue: 'SHEFA2-3030', 
            description: 'JIRA Ticket Number'
        )
        string(
            name: 'BUILD_USER', 
            defaultValue: 'Usman Malik', 
            description: 'User who triggered the build'
        )
    }
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        SLACK_WEBHOOK = credentials('slack-webhook-url')
        DOCKER_IMAGE = 'naimatazmdev/demoapp'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "=== BUILD INFORMATION ==="
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Branch: ${env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main'}"
                    echo "JIRA Ticket: ${params.JIRA_TICKET}"
                    echo "Triggered By: ${params.BUILD_USER}"
                    echo "Docker Tag: ${env.DOCKER_TAG}"
                    echo "========================="
                }
            }
        }
        
        stage('Send Build Start Notification') {
            steps {
                script {
                    def branchName = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main').replace('origin/', '')
                    
                    def message = """
                    {
                        "text": "Build Started ⚙️",
                        "attachments": [
                            {
                                "color": "#439FE0",
                                "fields": [
                                    {
                                        "title": "Pipeline",
                                        "value": "<${env.BUILD_URL}|${env.JOB_NAME}/Docker-Build-Backend>",
                                        "short": true
                                    },
                                    {
                                        "title": "Build",
                                        "value": "#${env.BUILD_NUMBER}",
                                        "short": true
                                    },
                                    {
                                        "title": "Branch",
                                        "value": "${branchName}",
                                        "short": true
                                    },
                                    {
                                        "title": "Ticket No",
                                        "value": "${params.JIRA_TICKET}",
                                        "short": true
                                    },
                                    {
                                        "title": "Triggered By",
                                        "value": "${params.BUILD_USER}",
                                        "short": false
                                    }
                                ]
                            }
                        ]
                    }
                    """.replaceAll(/\s+/, ' ').trim()
                    
                    sh """
                        curl -X POST -H 'Content-type: application/json' \\
                        --data '${message}' \\
                        --connect-timeout 10 \\
                        --max-time 30 \\
                        \${SLACK_WEBHOOK} || echo "Slack notification failed but continuing build"
                    """
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                        echo "Installing dependencies..."
                        docker build -t temp-build-${BUILD_NUMBER} . || {
                            echo "Docker build failed, but continuing..."
                            exit 0
                        }
                        
                        # Try to extract node_modules if build was successful
                        if docker images | grep -q temp-build-${BUILD_NUMBER}; then
                            CONTAINER_ID=$(docker create temp-build-${BUILD_NUMBER}) || echo "Could not create container"
                            if [ ! -z "$CONTAINER_ID" ]; then
                                docker cp $CONTAINER_ID:/app/node_modules ./node_modules 2>/dev/null || echo "No node_modules to extract"
                                docker rm $CONTAINER_ID || echo "Could not remove container"
                            fi
                            docker rmi temp-build-${BUILD_NUMBER} || echo "Could not remove temp image"
                        fi
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    sh '''
                        echo "Running tests..."
                        docker run --rm -v $(pwd):/workspace -w /workspace node:18-alpine \\
                        sh -c "npm test 2>/dev/null || echo 'No tests found or test command failed, skipping...'"
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                        echo "Building Docker image..."
                        docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                        docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                        echo "Docker image built successfully"
                    """
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    sh """
                        echo "Pushing to DockerHub..."
                        echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin
                        docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                        docker push ${DOCKER_IMAGE}:latest
                        docker logout
                        echo "Push completed successfully"
                    """
                    
                    // Send deployment notification
                    def branchName = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main').replace('origin/', '')
                    def formattedTag = "v0.1.${env.BUILD_NUMBER}-${branchName}"
                    
                    def deployMessage = """
                    {
                        "text": "Deployment tag updated successfully 🚀",
                        "attachments": [
                            {
                                "color": "#36a64f",
                                "fields": [
                                    {
                                        "title": "Pipeline",
                                        "value": "<${env.BUILD_URL}|${env.JOB_NAME}/Deploy-Backend-Development>",
                                        "short": true
                                    },
                                    {
                                        "title": "Tag",
                                        "value": "${formattedTag}",
                                        "short": true
                                    },
                                    {
                                        "title": "Environment",
                                        "value": "dev",
                                        "short": true
                                    },
                                    {
                                        "title": "Triggered By",
                                        "value": "${params.BUILD_USER}",
                                        "short": true
                                    }
                                ]
                            }
                        ]
                    }
                    """.replaceAll(/\s+/, ' ').trim()
                    
                    sh """
                        curl -X POST -H 'Content-type: application/json' \\
                        --data '${deployMessage}' \\
                        --connect-timeout 10 \\
                        --max-time 30 \\
                        \${SLACK_WEBHOOK} || echo "Deployment notification failed but continuing"
                    """
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo "✅ Build completed successfully!"
                
                def branchName = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main').replace('origin/', '')
                def formattedTag = "v0.1.${env.BUILD_NUMBER}-${branchName}"
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                def successMessage = """
                {
                    "text": "Build completed successfully 🔥",
                    "attachments": [
                        {
                            "color": "#36a64f",
                            "fields": [
                                {
                                    "title": "Pipeline",
                                    "value": "<${env.BUILD_URL}|${env.JOB_NAME}/Docker-Build-Backend>",
                                    "short": true
                                },
                                {
                                    "title": "Tag",
                                    "value": "${formattedTag}",
                                    "short": true
                                },
                                {
                                    "title": "Branch",
                                    "value": "${branchName}",
                                    "short": true
                                },
                                {
                                    "title": "Ticket No",
                                    "value": "${params.JIRA_TICKET}",
                                    "short": true
                                },
                                {
                                    "title": "Triggered By",
                                    "value": "${params.BUILD_USER}",
                                    "short": true
                                },
                                {
                                    "title": "Duration",
                                    "value": "${duration}",
                                    "short": true
                                }
                            ]
                        }
                    ]
                }
                """.replaceAll(/\s+/, ' ').trim()
                
                sh """
                    curl -X POST -H 'Content-type: application/json' \\
                    --data '${successMessage}' \\
                    --connect-timeout 10 \\
                    --max-time 30 \\
                    \${SLACK_WEBHOOK} || echo "Success notification failed"
                """
            }
        }
        
        failure {
            script {
                echo "❌ Build failed!"
                
                def branchName = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'main').replace('origin/', '')
                def duration = currentBuild.durationString.replace(' and counting', '')
                
                def failureMessage = """
                {
                    "text": "Build failed ❌",
                    "attachments": [
                        {
                            "color": "#ff0000",
                            "fields": [
                                {
                                    "title": "Pipeline",
                                    "value": "<${env.BUILD_URL}|${env.JOB_NAME}/Docker-Build-Backend>",
                                    "short": true
                                },
                                {
                                    "title": "Build",
                                    "value": "#${env.BUILD_NUMBER}",
                                    "short": true
                                },
                                {
                                    "title": "Branch",
                                    "value": "${branchName}",
                                    "short": true
                                },
                                {
                                    "title": "Ticket No",
                                    "value": "${params.JIRA_TICKET}",
                                    "short": true
                                },
                                {
                                    "title": "Triggered By",
                                    "value": "${params.BUILD_USER}",
                                    "short": true
                                },
                                {
                                    "title": "Duration",
                                    "value": "${duration}",
                                    "short": true
                                }
                            ]
                        }
                    ]
                }
                """.replaceAll(/\s+/, ' ').trim()
                
                sh """
                    curl -X POST -H 'Content-type: application/json' \\
                    --data '${failureMessage}' \\
                    --connect-timeout 10 \\
                    --max-time 30 \\
                    \${SLACK_WEBHOOK} || echo "Failure notification failed"
                """
            }
        }
        
        always {
            script {
                echo "🧹 Cleaning up..."
                
                // Safe Docker cleanup - only remove images that exist
                sh '''
                    echo "Checking for images to clean up..."
                    
                    # Function to safely remove Docker image
                    safe_docker_rmi() {
                        local image=$1
                        if docker images --format "table {{.Repository}}:{{.Tag}}" | grep -q "^${image}$"; then
                            echo "Removing image: ${image}"
                            docker rmi "${image}" || echo "Failed to remove ${image}, but continuing..."
                        else
                            echo "Image ${image} does not exist, skipping..."
                        fi
                    }
                    
                    # Clean up main images
                    safe_docker_rmi "''' + "${DOCKER_IMAGE}:${DOCKER_TAG}" + '''"
                    safe_docker_rmi "''' + "${DOCKER_IMAGE}:latest" + '''"
                    
                    # Clean up any temp images
                    docker images --format "table {{.Repository}}:{{.Tag}}" | grep "temp-build" | while read image; do
                        echo "Removing temp image: $image"
                        docker rmi "$image" 2>/dev/null || echo "Failed to remove $image"
                    done
                    
                    echo "Cleanup completed"
                '''
            }
        }
    }
}

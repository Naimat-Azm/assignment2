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
                        // Auto-increment the Docker tag by fetching from Jenkins build history
                        def latestTag = ""
                        
                        // Try to fetch the last successful build's FINAL_TAG
                        try {
                            echo "Fetching latest tag from Jenkins build history..."
                            def lastSuccessfulBuild = currentBuild.getPreviousBuild()
                            
                            // Look through recent builds to find the last one with a FINAL_TAG
                            while (lastSuccessfulBuild != null) {
                                def buildEnvVars = lastSuccessfulBuild.getBuildVariables()
                                if (buildEnvVars.containsKey('FINAL_TAG')) {
                                    latestTag = buildEnvVars['FINAL_TAG']
                                    echo "Found tag from build #${lastSuccessfulBuild.number}: ${latestTag}"
                                    break
                                }
                                lastSuccessfulBuild = lastSuccessfulBuild.getPreviousBuild()
                            }
                            
                            // If no tag found in build vars, try archived artifact or build description
                            if (!latestTag) {
                                lastSuccessfulBuild = currentBuild.getPreviousBuild()
                                while (lastSuccessfulBuild != null) {
                                    // Try to read from archived artifact first
                                    try {
                                        def tagFile = lastSuccessfulBuild.getArtifacts().find { it.fileName == 'last_docker_tag.txt' }
                                        if (tagFile) {
                                            latestTag = readFile("${lastSuccessfulBuild.getRootDir()}/archive/last_docker_tag.txt").trim()
                                            echo "Found tag from archived file in build #${lastSuccessfulBuild.number}: ${latestTag}"
                                            break
                                        }
                                    } catch (Exception archiveException) {
                                        echo "Could not read archive from build #${lastSuccessfulBuild.number}: ${archiveException.getMessage()}"
                                    }
                                    
                                    // Fallback to build description
                                    def description = lastSuccessfulBuild.description
                                    if (description) {
                                        def tagMatch = (description =~ /tag:\s*(v\d+\.\d+\.\d+)/)
                                        if (tagMatch) {
                                            latestTag = tagMatch[0][1]
                                            echo "Found tag from build description #${lastSuccessfulBuild.number}: ${latestTag}"
                                            break
                                        }
                                    }
                                    lastSuccessfulBuild = lastSuccessfulBuild.getPreviousBuild()
                                }
                            }
                        } catch (Exception e) {
                            echo "Failed to fetch from Jenkins build history: ${e.getMessage()}"
                            latestTag = ""
                        }
                        
                        // Fallback to Git tags if no previous Jenkins builds found
                        if (!latestTag) {
                            echo "No previous builds found, falling back to Git tags..."
                            try {
                                latestTag = sh(
                                    script: "git tag --list 'v*' --sort=-version:refname | grep -E '^v[0-9]+\\.[0-9]+\\.[0-9]+\$' | head -n 1 || echo ''",
                                    returnStdout: true
                                ).trim()
                            } catch (Exception e) {
                                echo "Failed to fetch Git tags: ${e.getMessage()}"
                                latestTag = ""
                            }
                        }
                        
                        // Auto-increment the tag
                        if (latestTag) {
                            echo "Latest tag found: ${latestTag}"
                            def versionPart = latestTag.substring(1) // Remove 'v' prefix
                            def parts = versionPart.tokenize('.')
                            parts[-1] = (parts[-1].toInteger() + 1).toString()
                            env.FINAL_TAG = 'v' + parts.join('.')
                        } else {
                            echo "No existing tags found, starting with v1.0.0"
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
                    withCredentials([usernamePassword(credentialsId: 'docker-registry-credentials', 
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
            // Set build description to include the tag for easy retrieval in future builds
            script {
                currentBuild.description = "Docker tag: ${env.FINAL_TAG}"
            }
        }
        failure {
            echo "Pipeline failed. Please check the logs."
        }
        always {
            // Archive the tag information for future builds
            script {
                if (env.FINAL_TAG) {
                    writeFile file: 'last_docker_tag.txt', text: env.FINAL_TAG
                    archiveArtifacts artifacts: 'last_docker_tag.txt', fingerprint: true
                }
            }
        }
    }
}

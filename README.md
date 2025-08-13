# Node.js Application with CI/CD Pipeline

A Node.js application with automated CI/CD pipeline using Jenkins, Docker, and GitHub webhooks.

## 🚀 Features

- **Automated CI/CD Pipeline** with Jenkins
- **Docker containerization** for consistent deployments
- **GitHub webhook integration** for automatic builds
- **Slack notifications** for build status
- **DockerHub integration** for image distribution

## 📋 CI/CD Pipeline Overview

Our Jenkins pipeline automatically:

### 🔄 **Trigger Conditions**
- **Push to `develop` branch** → Triggers full pipeline
- **Pull Request from `develop` to `main`** → Triggers full pipeline
- **Manual builds** → Available in Jenkins UI

### 🛠️ **Pipeline Stages**

| Stage | Description | Tools Used |
|-------|-------------|------------|
| **Checkout** | Download source code from GitHub | Git |
| **Install Dependencies** | Install Node.js packages | npm, Node.js 18 |
| **Run Tests** | Execute test suite | npm test |
| **Database Migrations** | Apply database changes | Custom scripts |
| **Build Docker Image** | Create containerized application | Docker |
| **Push to DockerHub** | Upload image to registry | DockerHub |
| **Notifications** | Send build status to Slack | Slack webhooks |

### 📊 **Build Artifacts**
- **Docker Image**: `naimatazmdev/assignment2:BUILD_NUMBER`
- **Latest Tag**: `naimatazmdev/assignment2:latest`

## ⚙️ Setup Instructions

### 1. **Jenkins Configuration**

#### Required Plugins:
- Generic Webhook Trigger Plugin
- Docker Pipeline Plugin
- Slack Notification Plugin

#### Credentials Setup:
```bash
# DockerHub credentials
ID: dockerhub-credentials
Username: your-dockerhub-username
Password: your-dockerhub-password

# Slack webhook
ID: slack-webhook-url
Secret: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

### 2. **GitHub Webhook Setup**

#### Webhook Configuration:
- **URL**: `http://YOUR_PUBLIC_IP:8080/generic-webhook-trigger/invoke?token=github-webhook-token`
- **Content Type**: `application/json`
- **Events**: Push events, Pull requests
- **Active**: ✅ Enabled

#### Network Requirements:
```bash
# If using private IP, set up port forwarding:
Router: External Port 8080 → Internal 192.168.24.128:8080

# Or use ngrok for testing:
ngrok http 8080
```

### 3. **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `DOCKERHUB_CREDENTIALS` | DockerHub login | Set in Jenkins credentials |
| `SLACK_WEBHOOK` | Slack notification URL | Set in Jenkins credentials |
| `DOCKER_IMAGE` | Image name | `naimatazmdev/assignment2` |
| `DOCKER_TAG` | Build version | `${BUILD_NUMBER}` |

## 🐳 Docker Usage

### Build Locally:
```bash
docker build -t assignment2:local .
```

### Run Container:
```bash
docker run -p 3000:3000 assignment2:local
```

### Pull from DockerHub:
```bash
docker pull naimatazmdev/assignment2:latest
docker run -p 3000:3000 naimatazmdev/assignment2:latest
```



## 📝 Development Workflow

### **Feature Development:**
1. Create feature branch from `develop`
2. Make changes and commit
3. Push to GitHub
4. Create PR to `develop` → Triggers CI
5. Merge after CI passes
6. Push to `develop` → Triggers deployment

### **Production Deployment:**
1. Create PR from `develop` to `main`
2. CI validates changes
3. Review and merge
4. Deploy from `main` branch

## 🔐 Security

- **Webhook token**: `github-webhook-token` (configured in Jenkinsfile)
- **Credentials**: Stored securely in Jenkins credentials store
- **Docker images**: Scanned for vulnerabilities
- **Secrets**: Never committed to repository

## 📞 Support

For CI/CD pipeline issues:
1. Check Jenkins build logs
2. Verify webhook delivery in GitHub
3. Test connectivity to Jenkins server
4. Review Slack notifications for error details
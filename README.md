# OpenAI Chat

An Angular-based web application for interacting with OpenAI's chat API.

## Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Podman** (for container builds)

## Running Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200/`. The development server will automatically reload when you make changes to the source files.

### 3. Build for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/openai-chat/` directory.

## Building the Container Image

This project uses a multi-stage Podman build that:
- Builds the Angular application using UBI-9 Node.js image
- Serves the application using UBI-9 httpd (Apache) on port 8080
- Runs as a non-privileged user for security

### Build Image

```bash
podman build -t openai-chat-ng:latest .
```

### Build with Custom Tag

```bash
podman build -t openai-chat-ng:v1.0.0 .
```

## Running the Container Image

### Basic Run

```bash
podman run -p 8080:8080 openai-chat-ng:latest
```

The application will be available at `http://localhost:8080/`.

### Run in Detached Mode

```bash
podman run -d -p 8080:8080 --name openai-chat openai-chat-ng:latest
```

### Run with Custom Port Mapping

```bash
podman run -p 3000:8080 openai-chat-ng:latest
```

This maps the container's port 8080 to your host's port 3000. Access the application at `http://localhost:3000/`.

### View Container Logs

```bash
podman logs openai-chat
```

### Stop the Container

```bash
podman stop openai-chat
```

## Container Details

- **Base Image**: Red Hat UBI-9 (Universal Base Image 9)
- **Web Server**: Apache httpd 24
- **Port**: 8080
- **User**: Non-privileged user (appuser, UID 1001 or 1000)
- **Security**: Runs as non-root user, SSL disabled (intended for reverse proxy termination)

## CI/CD

This project includes a GitHub Actions workflow that automatically builds and pushes multi-architecture container images to Quay.io when changes are pushed to the `main` branch.

The workflow builds images for both:
- **linux/amd64** (x86_64) - for Intel/AMD processors
- **linux/arm64** (ARM64) - for Apple Silicon (M1/M2/M3) and ARM-based servers

The multi-arch image is available at: `quay.io/mklaasse/openai-chat-ng:latest`

When you pull the image, it will automatically use the correct architecture for your system.

## Development

### Running Tests

```bash
npm test
```

### Code Scaffolding

Generate new components, services, and other Angular artifacts:

```bash
ng generate component component-name
ng generate service service-name
ng generate directive directive-name
```

For more information, see the [Angular CLI documentation](https://angular.io/cli).

# Stage 1: Build the Angular application
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS builder

# Switch to root for build operations
USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install to ensure platform-specific binaries like esbuild are installed)
RUN npm install

# Copy source code
COPY . .

# Build argument for git commit hash (optional, falls back to git if available)
ARG GIT_COMMIT
ENV GIT_COMMIT=${GIT_COMMIT}

# Build the Angular application for production
RUN npm run build

# Stage 2: Serve with httpd on UBI-9
FROM registry.access.redhat.com/ubi9/httpd-24:latest

# UBI httpd-24 already runs as UID 1001 by default, so we just need minimal configuration
USER root

# Copy built application from builder stage
COPY --from=builder /app/dist/openai-chat/browser /var/www/html/

# Configure httpd: change port to 8080 and fix runtime directories for non-privileged user
RUN sed -i 's/Listen 80/Listen 8080/' /etc/httpd/conf/httpd.conf && \
    
    if [ -f /etc/httpd/conf.d/ssl.conf ]; then \
      mv /etc/httpd/conf.d/ssl.conf /etc/httpd/conf.d/ssl.conf.disabled; \
    fi
# Expose port 8080
EXPOSE 8080

# UBI httpd-24 defaults to UID 1001, no need to switch user explicitly
# The image will automatically run as the default non-root user
CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]


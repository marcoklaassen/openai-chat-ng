# Stage 1: Build the Angular application
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS builder

# Switch to root for build operations
USER root

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Angular application for production
RUN npm run build

# Stage 2: Serve with httpd on UBI-9
FROM registry.access.redhat.com/ubi9/httpd-24:latest

# Switch to root for setup operations
USER root

# Create a non-privileged user (use UID 1000 if 1001 is taken)
RUN if ! getent group appuser >/dev/null 2>&1; then groupadd -r appuser; fi && \
    if ! getent passwd appuser >/dev/null 2>&1; then \
      if ! getent passwd 1001 >/dev/null 2>&1; then \
        useradd -r -g appuser -u 1001 appuser; \
      else \
        useradd -r -g appuser -u 1000 appuser; \
      fi; \
    fi

# Set working directory
WORKDIR /var/www/html

# Copy built application from builder stage
COPY --from=builder /app/dist/openai-chat/browser /var/www/html

# Configure httpd to listen on port 8080 and run as non-privileged user
RUN sed -i 's/Listen 80/Listen 8080/' /etc/httpd/conf/httpd.conf && \
    sed -i 's/User apache/User appuser/' /etc/httpd/conf/httpd.conf && \
    sed -i 's/Group apache/Group appuser/' /etc/httpd/conf/httpd.conf && \
    sed -i 's|PidFile run/httpd.pid|PidFile /tmp/httpd.pid|' /etc/httpd/conf/httpd.conf && \
    sed -i 's|ErrorLog "logs/error_log"|ErrorLog "/proc/self/fd/2"|' /etc/httpd/conf/httpd.conf && \
    sed -i 's|CustomLog "logs/access_log"|CustomLog "/proc/self/fd/1"|' /etc/httpd/conf/httpd.conf && \
    mkdir -p /tmp && \
    chown -R appuser:appuser /var/www/html && \
    chown -R appuser:appuser /etc/httpd && \
    if [ -f /etc/httpd/conf.d/mod_security.conf ]; then \
      sed -i 's|SecDebugLog.*|SecDebugLog /proc/self/fd/2|' /etc/httpd/conf.d/mod_security.conf 2>/dev/null || true; \
      sed -i 's|SecAuditLog.*|SecAuditLog /proc/self/fd/2|' /etc/httpd/conf.d/mod_security.conf 2>/dev/null || true; \
    fi && \
    if [ -f /etc/httpd/conf.d/ssl.conf ]; then \
      mv /etc/httpd/conf.d/ssl.conf /etc/httpd/conf.d/ssl.conf.disabled; \
    fi

# Expose port 8080
EXPOSE 8080

# Switch to non-privileged user
USER appuser

# Start httpd in foreground
CMD ["/usr/sbin/httpd", "-D", "FOREGROUND"]


# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

ARG BACKEND_URL=http://api:8000
RUN ESCAPED_URL=$(echo "${BACKEND_URL}" | sed 's|/|\\\/|g') && \
    printf 'server {\n\
  listen 3000;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
\n\
  location /webhook/ {\n\
    proxy_pass %s/webhook/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
    proxy_set_header Content-Type $content_type;\n\
    proxy_read_timeout 300s;\n\
    proxy_send_timeout 300s;\n\
  }\n\
\n\
  location /download/ {\n\
    proxy_pass %s/download/;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
    proxy_set_header X-Forwarded-Proto $scheme;\n\
  }\n\
}\n' "${BACKEND_URL}" "${BACKEND_URL}" > /etc/nginx/conf.d/default.conf

EXPOSE 3000

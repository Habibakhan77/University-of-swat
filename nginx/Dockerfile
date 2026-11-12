# Nginx reverse proxy with the Brotli module.
# Alpine's own nginx package is used (not the nginx:alpine image) because Alpine ships a matching
# brotli module package; the official image would need the module compiled from source.
FROM alpine:3.22

RUN apk add --no-cache nginx nginx-mod-http-brotli \
 && mkdir -p /var/cache/nginx /etc/nginx/certs \
 && chown -R nginx:nginx /var/cache/nginx \
 # Log to the container output (docker compose logs nginx)
 && ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf /etc/nginx/nginx.conf
COPY snippets/ /etc/nginx/snippets/

EXPOSE 80 443
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO /dev/null http://127.0.0.1/healthz || exit 1
# The master process binds 80/443; worker processes run as the unprivileged "nginx" user.
CMD ["nginx", "-g", "daemon off;"]

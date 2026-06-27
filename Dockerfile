# ── Build stage ──────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps from lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

COPY . .

# VITE_API_URL is baked into the JS bundle at build time.
# Leave it empty so the SPA uses relative URLs; nginx then proxies
# /api/* to the Go backend container (no CORS needed).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Runtime stage ─────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/nginx-health || exit 1

CMD ["nginx", "-g", "daemon off;"]

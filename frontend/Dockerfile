# Frontend Dockerfile for PulseWatch (Next.js + Tailwind CSS)
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Copy application source
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]

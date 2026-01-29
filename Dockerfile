# Stage 1: Build the Next.js app
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Build the Next.js app
RUN npm run build

# Stage 2: Run the built app
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=development
ENV PORT=5050

# Copy all files from the builder stage
COPY --from=builder /app ./

# Expose the port Next.js runs on
EXPOSE 5050

# Start the application
CMD ["npm", "start"]

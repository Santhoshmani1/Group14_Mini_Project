# ---- Build Stage ----
FROM node:lts-alpine AS build
WORKDIR /app

# Copy package files and install all dependencies (including dev dependencies)
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# This stage creates the final, lean image
FROM node:lts-alpine
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main"]

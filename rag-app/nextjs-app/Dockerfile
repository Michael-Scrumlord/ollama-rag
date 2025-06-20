# Use an official Node.js runtime as a parent image
FROM node:18-alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm globally if you plan to use it, or stick to npm/yarn
# RUN npm install -g pnpm

# Copy package.json and lock file
COPY package.json ./
# Assuming npm, copy package-lock.json if it exists. If using yarn, copy yarn.lock.
# If using pnpm, copy pnpm-lock.yaml.
COPY package-lock.json* ./
# COPY yarn.lock ./
# COPY pnpm-lock.yaml ./

# Install app dependencies
# If using pnpm: RUN pnpm install --frozen-lockfile
# If using yarn: RUN yarn install --frozen-lockfile
RUN npm install

# Bundle app source
COPY . .

# Expose port 3000
EXPOSE 3000

# Define the command to run the app
# Using "npm run dev" for development to enable hot-reloading.
# For production, you would typically use "npm run build" and "npm run start".
CMD ["npm", "run", "dev"]

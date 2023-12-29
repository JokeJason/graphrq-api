# Use official Node.js LTS (Long Term Support) version as a parent image
FROM node:18.19.0

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Copy the rest of your app's source code into the working directory
COPY . .

# Build your app
RUN npm run build

# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the rest of the app source code to the container
COPY . .

# Build the NestJS app
RUN npm run build

# Expose the port that the app will listen on
EXPOSE 3000

# Set the command to run the app when the container starts
CMD [ "node", "dist/main.js" ]

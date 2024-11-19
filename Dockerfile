# Fetching the minified node image on apline linux
FROM node:alpine

# Setting up the work directory
WORKDIR /app

# Copy only the package.json and package-lock.json (if exists) to leverage Docker cache
COPY package.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

CMD ["node", "index.js"]

EXPOSE 3001


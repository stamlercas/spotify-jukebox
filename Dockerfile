FROM node:18

ENV PORT=8080

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

# binds to port 8080 to have it mapped by the docker daemon
EXPOSE 8080

RUN npm run build
CMD ["npm", "start"]

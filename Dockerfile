FROM node:8-alpine
RUN apk --update --no-progress add unrar bash git
WORKDIR /web

# Install app dependencies
COPY package.json package-lock.json ./
RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "dist/server.js" ]

EXPOSE 3000

VOLUME ["/comics"]
VOLUME ["/config"]

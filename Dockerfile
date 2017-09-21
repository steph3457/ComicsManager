FROM node:8-alpine
RUN apk --update --no-progress add unrar bash git

VOLUME ["/comics"]
VOLUME ["/web"]

WORKDIR /web

EXPOSE 3000
EXPOSE 3001

CMD [ "npm", "install" ]
CMD [ "npm", "run build" ]
CMD [ "node", "dist/server.js" ]

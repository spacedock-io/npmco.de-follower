FROM node:0.10.33
ADD . /opt/follower
WORKDIR /opt/follower
RUN npm install
CMD node index.js config.json

FROM node:16
ENV NODE_ENV production
WORKDIR /movies
COPY package*.json ./
RUN npm ci
COPY . .
CMD node index.js
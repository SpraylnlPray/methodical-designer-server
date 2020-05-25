# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --production --silent

ENV PORT=8080
ENV ENDPOINT=/graphql
ENV DB_DEV_PW=methodical-neo-dev
ENV DB_USER=neo4j
ENV DB_DEV_HOST=ec2-18-191-205-166.us-east-2.compute.amazonaws.com
ENV DB_PORT=7687
ENV NODE_ENV=development

# add app
COPY . ./

# start app
CMD ["npm", "run", "start-prod"]
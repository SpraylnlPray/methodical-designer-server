# pull official base image
FROM node:13.12.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

ENV PORT=8080
ENV ENDPOINT=/graphql
ENV DB_PW=methodical
ENV DB_USER=neo4j
ENV DB_HOST=0.0.0.0
ENV DB_PORT=7687

# add app
COPY . ./

# start app
CMD ["npm", "run", "start-dev"]
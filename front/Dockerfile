FROM node:16.18-alpine

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

WORKDIR /app

COPY package.json ./ 

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]`
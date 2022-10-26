FROM node:16.18-alpine as builder

ARG DATABASE_URL
ARG JWT_SECRET
ARG PEPPER
ARG HMAC_PASSPHRASE
ARG CRYPTO_IV

ENV NODE_ENV build
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV PEPPER=$PEPPER
ENV HMAC_PASSPHRASE=$HMAC_PASSPHRASE
ENV CRYPTO_IV=$CRYPTO_IV

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .
COPY /prisma .
COPY tsconfig.build.json .
COPY tsconfig.json .

# Install app dependencies
RUN npm install
RUN npx prisma generate

COPY /dtos dtos
COPY /src src

RUN npm run build

FROM node:16.18-alpine
# Create app directory
WORKDIR /app

COPY --from=builder ./app .

EXPOSE 3000

CMD npx prisma migrate deploy; node /dist/src/main.js
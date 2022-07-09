###
###   NESTJS DOCKERFILE
###

# global variables
ARG NODE=node:16.16.0-alpine
ARG APP_DIR='/app/'




##
## STAGE 1: node setup
##
FROM ${NODE} AS builder

ARG APP_DIR
ARG ENV

# working directory setup
WORKDIR ${APP_DIR}

COPY package*.json ${APP_DIR}
RUN npm ci

COPY . ${APP_DIR}

# builds the app
ENV NODE_ENV production
RUN npm run build:${ENV}




##
## STAGE 2: server setup
##
FROM ${NODE}

ARG APP_DIR

# working directory setup
WORKDIR ${APP_DIR}

# sets NGINX
COPY --from=builder ${APP_DIR}'dist' ${APP_DIR}
COPY --from=builder ${APP_DIR}'package*.json' ${APP_DIR}

# alpine security updates
RUN apk --no-cache -U upgrade

ENV NODE_ENV production
RUN npm ci --production
RUN npm cache clean --force

# non root user mode
RUN chown -R node:node ${APP_DIR}
USER node

# exec command
ENTRYPOINT ["node", "main"]

###
###   REACT DOCKERFILE
###   Uses Node and NGINX.
###

# variables
ARG NODE=node:15.8.0-alpine
ARG APP_DIR='/app/'

##
## STAGE 1: node setup
##
FROM ${NODE} AS builder

ARG APP_DIR
ARG ENV

# working directory setup
WORKDIR ${APP_DIR}

COPY package.json ${APP_DIR}
RUN yarn install --no-lockfile

COPY . ${APP_DIR}
# builds the app
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
COPY --from=builder ${APP_DIR}'package.json' ${APP_DIR}

# alpine security updates
RUN apk --no-cache -U upgrade

# RUN npm install --no-optional --force
RUN yarn install --production --ignore-optional --no-lockfile
RUN yarn cache clean

# exec command
ENTRYPOINT ["node"]
CMD ["main"]

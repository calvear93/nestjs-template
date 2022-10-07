###
###   NESTJS API REST
###

# global variables
ARG NODE=node:18.10.0-alpine
ARG APP_DIR='/app/'
ARG OUT_DIR='dist'




##
## STAGE 1: app build
##
FROM ${NODE} AS builder

ARG APP_DIR
ARG OUT_DIR
ARG ENV

WORKDIR ${APP_DIR}

# adds node-prune (https://github.com/tj/node-prune)
RUN apk add curl
RUN curl -sf 'https://gobinaries.com/tj/node-prune' | sh

# prepares source files
COPY . ${APP_DIR}
RUN npm ci --ignore-scripts

# builds the app
ENV NODE_ENV production
RUN npm run build:${ENV}
COPY 'package*.json' ${OUT_DIR}/

# install app dependencies
WORKDIR ${APP_DIR}${OUT_DIR}
RUN npm ci --omit=dev
RUN node-prune




##
## STAGE 2: server setup
##
FROM ${NODE}

ARG APP_DIR
ARG OUT_DIR

WORKDIR ${APP_DIR}

# gets build app
COPY --from=builder ${APP_DIR}${OUT_DIR} ${APP_DIR}

# alpine security updates
RUN apk --no-cache -U upgrade

# localization
ENV TZ America/Santiago
ENV LANG es-CL.UTF-8

# non root user mode
RUN chown -R node:node ${APP_DIR}
USER node

# exec command
ENTRYPOINT ["node"]
CMD ["main"]

EXPOSE 8080/tcp

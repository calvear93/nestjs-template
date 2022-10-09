###
###   NESTJS
###

# global variables
ARG NODE=node:18.10.0-alpine
ARG LANG=America/Santiago
ARG TIME_ZONE=es-CL.UTF-8
ARG APP_DIR='/app/'
ARG OUT_DIR='dist'


##
## STAGE 0: base config
##
FROM ${NODE} AS base
# base args
ARG APP_DIR
ARG OUT_DIR
ARG ENV

WORKDIR ${APP_DIR}


##
## STAGE 1: build
##
FROM base AS builder
# prepares source files
COPY . ${APP_DIR}
RUN npm ci --ignore-scripts
# download environment secrets
RUN node_modules/.bin/env pull -e ${ENV} -o
# builds the app
ENV NODE_ENV production
RUN npm run build:${ENV}
COPY 'package*.json' ${OUT_DIR}/


##
## STAGE 2: prepare
##
FROM base AS bundler
# adds node-prune (https://github.com/tj/node-prune)
RUN apk add curl
RUN curl -sf 'https://gobinaries.com/tj/node-prune' | sh
# gets build app
COPY --from=builder ${APP_DIR}${OUT_DIR} ${APP_DIR}
# install app build dependencies
RUN npm ci --omit=dev --no-optional --ignore-scripts
RUN node-prune
# removes unnecessary files and dependencies
RUN rm -rf \
    'package.json' \
    'package-lock.json' \
    'node_modules/.bin/'


##
## STAGE 3: exec
##
FROM ${NODE}

ARG APP_DIR
ARG LANG
ARG TIME_ZONE
# workspace
WORKDIR ${APP_DIR}
# build artifacts
COPY --from=bundler ${APP_DIR} ${APP_DIR}
# alpine security updates
RUN apk --no-cache -U upgrade
# localization
ENV TZ ${TIME_ZONE}
ENV LANG ${LANG}
# non root user mode
RUN chown -R node:node ${APP_DIR}
USER node

# exec command
ENV NODE_ENV production
ENTRYPOINT ["node"]
CMD ["main"]

EXPOSE 8080/tcp

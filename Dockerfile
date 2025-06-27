###
###   ALPINE: NESTJS using VITE
###

# global variables
# https://hub.docker.com/_/node
ARG NODE=node:22.17.0-alpine
ARG TIME_ZONE='America/Santiago'
ARG LANG='es-CL.UTF-8'
ARG PNPM_VER=10.12.4
ARG APP_DIR='/app/'
ARG OUT_DIR='dist'


##
## STAGE 0: base config
##
FROM ${NODE} AS base

ARG PNPM_VER
# installs pnpm
RUN npm i -g pnpm@${PNPM_VER}


##
## STAGE 1: build
##
FROM base AS builder

ARG APP_DIR
ARG OUT_DIR

WORKDIR ${APP_DIR}

# prepares source files
COPY . ${APP_DIR}
RUN pnpm install --frozen-lockfile
# builds the app
ENV NODE_ENV=production
RUN pnpm build


##
## STAGE 2: prepare
##
FROM base AS bundler

ARG APP_DIR
ARG OUT_DIR

WORKDIR ${APP_DIR}

# adds node-prune (https://github.com/tj/node-prune)
RUN apk add curl
RUN curl -sf 'https://gobinaries.com/tj/node-prune' | sh
# gets build app
COPY --from=builder ${APP_DIR}${OUT_DIR} ${APP_DIR}
# install app build dependencies
RUN pnpm install --prod --no-optional --ignore-scripts
RUN node-prune
# removes unnecessary files and dependencies
RUN rm -rf \
	'pnpm-lock.yaml' \
	'node_modules/.bin/'


##
## STAGE 3: exec
##
FROM ${NODE}

ARG APP_DIR
ARG LANG
ARG TIME_ZONE

WORKDIR ${APP_DIR}

# build artifacts
COPY --from=bundler ${APP_DIR} ${APP_DIR}
# alpine security updates
RUN apk --no-cache -U upgrade
# localization
ENV TZ=${TIME_ZONE}
ENV LANG=${LANG}
# non root user mode
RUN chown -R node:node ${APP_DIR}
USER node

# exec command
ENV NODE_ENV=production
ENTRYPOINT ["node"]
CMD ["main"]

EXPOSE 8080/tcp

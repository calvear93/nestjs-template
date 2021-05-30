#
# Node Package Manager
#

# npm update
npm install -g npm@latest
# rebuild node-sass lib
npm rebuild node-sass
# soft updated for packages
npm update --save/--save-dev
# hard update for packages
npx npm-check-updates -u
# git case-sensitive enable
git config core.ignorecase false

#
# Docker
#

# docker build
docker build --build-arg ENV=[development|qa|stage|production] --tag [image_name] .
# docker exec
docker run -d -it -p [expose_port]:80/tcp --name [instance_name] [image_name]

#
# TypeORM
#

# creates a new blank migration file
npm run orm -- migration:create -n [migration_name]

# generates a new migration from schema changes
npm run orm -- migration:generate -n [migration_name]

# syncrhonizes migrations with database
npm run orm -- migration:run

# reverts last migration applied to database
npm run orm -- migration:revert

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
# docker build
docker build --build-arg ENV=development --tag docker-image .
# docker exec
docker run -d -it -p 4001:80/tcp --name docker-image-instance docker-image

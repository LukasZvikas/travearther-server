FROM node:alpine as builder
WORKDIR '/app'
COPY package.json .
RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install
COPY . .
RUN npm run build

FROM nginx
COPY --from=builder /app/build /usr/share/nginx

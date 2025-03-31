FROM node:22
COPY . /app
RUN cd /app && npm install --loglevel verbose && npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
CMD ["/usr/sbin/nginx", "-g", "daemon off;"]
EXPOSE 8080

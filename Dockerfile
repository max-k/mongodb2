FROM node

MAINTAINER Thomas Sarboni <max-k@post.com>

WORKDIR /var/www

# Install Mean.JS Prerequisites
RUN npm install -g grunt-cli
RUN npm install -g bower

# Make www-data owner of /var/www
RUN chown www-data /var/www

# Change user
USER www-data

# Push dependencies configuration
ADD package.json /var/www/package.json
ADD .bowerrc /var/www/.bowerrc
ADD bower.json /var/www/bower.json

# Install dependencies
RUN npm install

# Manually trigger bower. Not needed since user isn't root.
#RUN bower install --config.interactive=false --allow-root

# Make everything available for start
ADD . /var/www/

# currently only works for development
ENV NODE_ENV development

# Port 3000 for server
# Port 35729 for livereload
EXPOSE 3000 35729
CMD ["grunt"]

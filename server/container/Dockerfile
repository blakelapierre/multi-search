FROM zenato/puppeteer

USER root

ADD ./app /app

RUN cd /app && npm install --production

CMD node /app/.dist/index.js

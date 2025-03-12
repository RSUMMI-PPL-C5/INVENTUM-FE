FROM node:22

WORKDIR /app

COPY . /app

RUN npm install --legacy-peer-deps

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

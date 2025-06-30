FROM node:22.14-bullseye-slim

WORKDIR /usr/src

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

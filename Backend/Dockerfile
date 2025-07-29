FROM node:18-alpine

WORKDIR /app

# Copy and install only what's needed
COPY package*.json ./
RUN npm install

# Copy the rest of the app source
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]

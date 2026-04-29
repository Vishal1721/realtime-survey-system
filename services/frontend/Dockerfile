FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# For Vite, use 5173; for Create React App, use 3000
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

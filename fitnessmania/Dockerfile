FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

# ✅ Copy full backend folder early
COPY backend ./backend
RUN cd backend && npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "backend/server.js"]

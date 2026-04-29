require("dotenv").config();
const redis = require("redis");
const WebSocket = require("ws");
const express = require("express"); 
const app = express(); 

const subscriber = redis.createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

subscriber.on("error", (err) => console.log("Redis Client Error", err));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "response-service",
  });
});

app.listen(3001, () => {
  console.log("Health check running on port 3001");
});

const wss = new WebSocket.Server({
  port: 4000,
  host: "0.0.0.0", 
});

let clients = [];

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter((client) => client !== ws);
  });
});

const start = async () => {
  await subscriber.connect();

  await subscriber.subscribe("poll-updates", (message) => {
    console.log("Received update:", message);

 
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
};

start();

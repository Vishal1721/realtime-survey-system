require("dotenv").config();
const redis = require("redis");
const WebSocket = require("ws");
const subscriber = redis.createClient();

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "response-service",
  });
});

const wss = new WebSocket.Server({ port: 4000 });

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

const express = require("express");
const bodyParser = require("body-parser");
const { Kafka } = require("kafkajs");

const app = express();
app.use(bodyParser.json());


const kafka = new Kafka({
  clientId: "response-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const startServer = async () => {
  await producer.connect();

  app.post("/api/submit", async (req, res) => {
    try {
      const data = req.body;

      await producer.send({
        topic: "survey-responses",
        messages: [
          {
            value: JSON.stringify(data),
          },
        ],
      });

      res.status(200).json({ message: "Response sent to Kafka" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.listen(3000, () => {
    console.log("Response Service running on port 3000 🚀");
  });
};

startServer();

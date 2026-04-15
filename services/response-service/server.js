require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Kafka } = require("kafkajs");
const Joi = require('joi');
const app = express();
app.use(bodyParser.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "response-service",
  });
});

const kafka = new Kafka({
  clientId: "response-service",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();

const startServer = async () => {
  await producer.connect();

  app.post("/api/submit", async (req, res) => {
      const schema = Joi.object({
        pollId: Joi.string().required(),
        option: Joi.string().required(),
      });
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }


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

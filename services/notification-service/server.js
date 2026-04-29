const { Kafka } = require("kafkajs");
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "response-service",
  });
});

app.listen(3003, () => {
  console.log("Notification health check on port 3003");
});

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "notification-group" });

const start = async () => {
  let connected = false;

  // 1. Connection Retry Loop
  while (!connected) {
    try {
      console.log("Attempting to connect to Kafka...");
      await consumer.connect();
      console.log("Successfully connected to Kafka! 🚀");
      connected = true;
    } catch (error) {
      console.error(
        "Kafka connection failed. Retrying in 5 seconds...",
        error.message,
      );
      // Wait for 5 seconds before trying again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  try {
    // 2. Subscribe to the topic
    await consumer.subscribe({
      topic: "survey-responses",
      fromBeginning: false,
    });

    // 3. Start the consumer runner
    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          console.log("📢 Notification Service received:", data);
        } catch (parseError) {
          console.error("Error parsing message value:", parseError.message);
        }
      },
    });
  } catch (error) {
    console.error("Error during consumer subscription/run:", error);
  }
};

start();


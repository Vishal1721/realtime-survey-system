const { Kafka } = require("kafkajs");
const dotenv = require("dotenv");
dotenv.config();

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "response-service",
  });
});

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "notification-group" });

const start = async () => {
  await consumer.connect();

  await consumer.subscribe({
    topic: "survey-responses",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());

      console.log("📢 Notification Service received:", data);
    },
  });
};

start();

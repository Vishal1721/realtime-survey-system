require("dotenv").config();
const { Kafka } = require("kafkajs");
const redis = require("redis");
const kafka = new Kafka({
  clientId: "aggregation-service",
  brokers: [process.env.KAFKA_BROKER],
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "response-service",
  });
});

const consumer = kafka.consumer({ groupId: "survey-group" });

const redisClient = redis.createClient();

const start = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "survey-responses", fromBeginning: true });

  await redisClient.connect();

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const data = JSON.parse(message.value.toString());

        const { pollId, option } = data;

        console.log("Processing:", data);

        await redisClient.hIncrBy(`poll:${pollId}`, option, 1);
        await redisClient.publish(
          "poll-updates",
          JSON.stringify({ pollId, option }),
        );
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

start();

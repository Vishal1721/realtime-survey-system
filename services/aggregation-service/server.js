const { Kafka } = require("kafkajs");
const redis = require("redis");

const kafka = new Kafka({
  clientId: "aggregation-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "survey-group" });

const redisClient = redis.createClient();

const start = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "survey-responses", fromBeginning: true });

  await redisClient.connect();

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());

      const { pollId, option } = data;

      console.log("Processing:", data);

      await redisClient.hIncrBy(`poll:${pollId}`, option, 1);
      await redisClient.publish(
        "poll-updates",
        JSON.stringify({ pollId, option }),
      );
    },
  });
};

start();

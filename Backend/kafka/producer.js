const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "task-app",
  brokers: ["localhost:9092"]
});

const producer = kafka.producer();

const produceNotification = async (data) => {
 await producer.connect();
  await producer.send({
    topic: "notifications",
    messages: [
      {
        value: JSON.stringify(data),
      },
    ],
  });
  await producer.disconnect();
};

module.exports = produceNotification;

const { Kafka } = require("kafkajs");
const { app, io, onlineUsers } = require("../server/server");
const mongoose = require("mongoose");
const { createNotification } = require("../services/notificationService");
const PushSubscription = require("../models/PushSubscription");
const webpush = require("web-push");

const kafka = new Kafka({
  clientId: "notification-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "notification-group" });

const startConsumer = async () => {
  try {
    // ⏳ Wait to ensure users have registered sockets
    console.log("⏳ Waiting 5 seconds before starting Kafka consumer...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await consumer.connect();
    await consumer.subscribe({ topic: "notifications", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        const { userId, message: notifMsg } = data;

        console.log("\n📩 Received Kafka Message:", data);
        console.log("🗺️ Current online users:", Array.from(onlineUsers.entries()));

        // Step 1: Save notification in DB
        const notif = await createNotification(
          userId,
          notifMsg,
          "Task Assigned"
        );

        // Step 2: Emit in-app notification if user is online
        const socketId = onlineUsers.get(userId.toString());
        console.log("📡 socketId for user:", socketId);

        if (socketId) {
          io.to(socketId).emit("notification", {
            message: notif.message,
            createdAt: notif.createdAt,
          });
          console.log("✅ Notification sent to frontend via socket.");
        } else {
          console.log("⚠️ User is offline. No socket ID found.");
        }

        // Step 3: Send push notification
        const sub = await PushSubscription.findOne({
          userId: new mongoose.Types.ObjectId(userId),
        });

        if (sub) {
          const payload = JSON.stringify({
            title: "Task Manager",
            body: notifMsg,
          });

          try {
            await webpush.sendNotification(sub.subscription, payload);
            console.log("✅ Web Push notification sent.");
          } catch (pushErr) {
            console.error("❌ Failed to send Web Push:", pushErr);
          }
        }
      },
    });

    console.log("✅ Kafka consumer is now listening...");
  } catch (err) {
    console.error("❌ Kafka Consumer Error:", err);
  }
};

module.exports = startConsumer;

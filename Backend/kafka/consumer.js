const { Kafka } = require("kafkajs");
const { app, io, onlineUsers } = require("../server/server");
const mongoose = require("mongoose");
const { createNotification } = require("../services/notificationService");
const PushSubscription = require("../models/PushSubscription");
const User = require("../models/User");
const { sendEmailNotification } = require("../services/mailService");
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
        const { userId, message: notifMsg, type } = data;


        // Step 1: Save notification in DB
        const notif = await createNotification(
          userId,
          notifMsg,
          type
        );

        // Step 2: Emit in-app notification if user is online
        const socketId = onlineUsers.get(userId.toString());

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

        //Step 4: Send email notification

        const user = await User.findById(userId).select("email");
        if (user && user.email) {
          try {
            // Assuming you have a function to send emails
            await sendEmailNotification(
              user.email,
               type,
               notifMsg,
            );
            console.log("✅ Email notification sent.");
          } catch (emailErr) {
            console.error("❌ Failed to send email:", emailErr);
          }
        } else {
          console.warn("⚠️ User email not found for notification:", userId);
        }
      },
    });

    console.log("✅ Kafka consumer is now listening...");
  } catch (err) {
    console.error("❌ Kafka Consumer Error:", err);
  }
};

module.exports = startConsumer;

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

const sendChatNotification = async ({ userId, chatId, senderId, message }) => {
  const notif = await createNotification(userId, message, "CHAT_MESSAGE");

  // Emit in-app notification to all sockets of this user
  const socketIds = onlineUsers.get(userId.toString());
  if (socketIds) {
    socketIds.forEach(sockId => {
      io.to(sockId).emit("chatNotification", {
        message: notif.message,
        createdAt: notif.createdAt,
        chatId,
        senderId,
      });
    });
    console.log(`✅ Chat notification sent to user ${userId} via sockets.`);
  }

  // Send Web Push
  const sub = await PushSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (sub) {
    const payload = JSON.stringify({
      title: "New Message",
      body: message,
      data: { chatId, senderId },
    });

    try {
      await webpush.sendNotification(sub.subscription, payload);
      console.log("✅ Web Push chat notification sent.");
    } catch (pushErr) {
      console.error("❌ Failed to send Web Push chat notification:", pushErr);
    }
  }

  // Email not needed for chat
};

const sendOtherNotification = async ({ userId, type, message }) => {
  const notif = await createNotification(userId, message, type);

  // Emit in-app notification
  const socketIds = onlineUsers.get(userId.toString());
  if (socketIds) {
    socketIds.forEach(sockId => {
      io.to(sockId).emit("notification", {
        message: notif.message,
        createdAt: notif.createdAt,
        type,
      });
    });
    console.log(`✅ ${type} notification sent to user ${userId} via sockets.`);
  }

  // Web Push
  const sub = await PushSubscription.findOne({
    userId: new mongoose.Types.ObjectId(userId),
  });
  if (sub) {
    const payload = JSON.stringify({
      title: "Task Manager",
      body: message,
      data: { type },
    });

    try {
      await webpush.sendNotification(sub.subscription, payload);
      console.log(`✅ Web Push ${type} notification sent.`);
    } catch (pushErr) {
      console.error(`❌ Failed to send Web Push ${type} notification:`, pushErr);
    }
  }

  // Email
  const user = await User.findById(userId).select("email");
  if (user && user.email) {
    try {
      await sendEmailNotification(user.email, type, message);
      console.log(`✅ Email ${type} notification sent.`);
    } catch (emailErr) {
      console.error(`❌ Failed to send email ${type} notification:`, emailErr);
    }
  }
};

const startConsumer = async () => {
  try {
    console.log("⏳ Waiting 5 seconds before starting Kafka consumer...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    await consumer.connect();
    await consumer.subscribe({ topic: "notifications", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        const { userId, type, message: notifMsg, chatId, senderId } = data; 
       console.log(type,"type");
        if (type === "CHAT_MESSAGE") {
          await sendChatNotification({ userId, chatId, senderId, message: notifMsg });
        } else {
          await sendOtherNotification({ userId, type, message: notifMsg });
        }
      },
    });

    console.log("✅ Kafka consumer is now listening...");
  } catch (err) {
    console.error("❌ Kafka Consumer Error:", err);
  }
};

module.exports = startConsumer;

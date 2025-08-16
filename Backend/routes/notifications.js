// routes/notifications.js
const express = require("express");
const mongoose = require("mongoose")
const router = express.Router();
const PushSubscription = require("../models/PushSubscription");
const notification = require("../models/Notification")
const verifyToken = require('../middlewares/authMiddleware');

router.post("/subscribe", async (req, res) => {
  const { userId, subscription, permission } = req.body;

  if (!userId || !permission) {
    return res.status(400).json({ message: "Missing userId or permission" });
  }

  if (permission === "granted") {
    await PushSubscription.findOneAndUpdate(
      { userId },
      { subscription },
      { upsert: true }
    );
    return res.status(201).json({ message: "Subscription saved" });
  }

  if (permission === "denied") {
    await PushSubscription.deleteOne({ userId });
    return res.status(200).json({ message: "Subscription removed" });
  }

  return res.status(400).json({ message: "Unsupported permission value" });
});


router.get("/", verifyToken,async (req, res) => {
  const { userId } = req.user;
 const data =  await notification.find({userId:new mongoose.Types.ObjectId(userId),isRead:false, type:{$ne:"CHAT_MESSAGE"} })
  res.status(201).json({ message: "Notification list", data:data });
});

router.post("/read", verifyToken,async (req, res) => {
  const { userId } = req.user;
 const data =  await notification.updateOne({userId:new mongoose.Types.ObjectId(userId)},{$set:{
    isRead:true
 }})
  res.status(201).json({ message: "Notification seen", data:data });
});

router.post("/read-all", verifyToken,async (req, res) => {
  const { userId } = req.user;
 const data =  await notification.updateMany({userId:new mongoose.Types.ObjectId(userId)},{$set:{
    isRead:true
 }})
  res.status(201).json({ message: "Notification seen", data:data });
});
module.exports = router;

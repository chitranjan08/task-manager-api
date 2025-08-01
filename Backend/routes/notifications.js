// routes/notifications.js
const express = require("express");
const mongoose = require("mongoose")
const router = express.Router();
const PushSubscription = require("../models/PushSubscription");
const notification = require("../models/Notification")
const verifyToken = require('../middlewares/authMiddleware');

router.post("/subscribe", async (req, res) => {
  const { userId, subscription } = req.body;
  await PushSubscription.findOneAndUpdate(
    { userId },
    { subscription },
    { upsert: true }
  );
  res.status(201).json({ message: "Subscription saved" });
});

router.get("/", verifyToken,async (req, res) => {
  const { userId } = req.user;
 const data =  await notification.find({userId:new mongoose.Types.ObjectId(userId),isRead:false })
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

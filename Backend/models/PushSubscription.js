// models/PushSubscription.js
const mongoose = require("mongoose");
const PushSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscription: Object,
});
module.exports = mongoose.model("PushSubscription", PushSubscriptionSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ChatSchema = new Schema({
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true,
    index: true
  },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  groupName: { type: String, default: null, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isArchived: { type: Boolean, default: false, index: true }
}, { timestamps: true });

ChatSchema.index({ type: 1, members: 1 });

module.exports = mongoose.model('Chat', ChatSchema);

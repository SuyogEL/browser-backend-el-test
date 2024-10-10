import mongoose from "mongoose";

const tabSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  tabId: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  history: [{
    previousUrl: String,
    previousTitle: String,
    changedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  openedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  closedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Tab = mongoose.model('Tab', tabSchema);
module.exports = Tab;

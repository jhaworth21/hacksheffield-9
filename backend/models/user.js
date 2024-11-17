const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  streakCount: { type: Number, default: 0 },
  lastCompleted: { type: String }
}, { _id: true });

const profileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  profilePicture: { type: String }
}, { _id: false });

const userSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  tasks: [taskSchema],
  profile: profileSchema
});

const User = mongoose.model('User', userSchema);

module.exports = User;

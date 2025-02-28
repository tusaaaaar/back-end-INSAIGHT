// models/Usersmodel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
 
 


  name: { type: String, required: true },
  registrationNo: { type: String, unique: true, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'default-profile-pic-url' },
  // profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" }, // Reference to GridFS file
 

  bio: { type: String,  maxlength: 150 },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  dateCreatedAt: { type: Date, default: Date.now },
  dateUpdatedAt: { type: Date, default: Date.now },
});

// Middleware to update `dateUpdatedAt` before saving changes
userSchema.pre('save', function (next) {
  this.dateUpdatedAt = new Date();
  next();
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  }, // Reference to the post being commented on
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: true 
  }, // Commenting user
  text: { 
    type: String, 
    required: true 
  }, // Comment text
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }], // Array of replies to a comment
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Comment", commentSchema);

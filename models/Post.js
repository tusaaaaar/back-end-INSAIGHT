// const mongoose = require("mongoose");

// const PostSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
//   caption: { type: String, maxlength: 500 },
//   images: [{ type: String }], // Store Cloudinary image URLs
//   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
//   comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comments" }],
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Post", PostSchema);

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: true 
  },
  caption: { 
    type: String, 
    maxlength: 500 
  },
  images: [{ 
    type: String // Stores Cloudinary image URLs
  }], 
  content: { 
    type: String // Stores article text (optional)
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users" 
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model("Post", postSchema);

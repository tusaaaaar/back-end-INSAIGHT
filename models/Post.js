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
//the schema without the comments
// const mongoose = require("mongoose");

// const postSchema = new mongoose.Schema({
//   user: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Users", 
//     required: true 
//   },
//   caption: { 
//     type: String, 
//     maxlength: 500 
//   },
//   images: [{ 
//     type: String // Stores Cloudinary image URLs
//   }], 
//   content: { 
//     type: String // Stores article text (optional)
//   },
//   likes: [{ 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "Users" 
//   }],
//   comments: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
//   }],
//   createdAt: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// module.exports = mongoose.model("Post", postSchema);



//this schmea is for post+comments+reply
// const mongoose = require("mongoose");
// const postSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
//   caption: { type: String, maxlength: 500 },
//   images: [{ type: String }], // Cloudinary URLs
//   content: { type: String }, // For article posts
//   likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
//   comments: [
//     {
//       _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
//       user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//       text: { type: String, required: true },
//       createdAt: { type: Date, default: Date.now },
//       likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }], // Likes on comments
//       replies: [
//         {
//           _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
//           user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//           text: { type: String, required: true },
//           createdAt: { type: Date, default: Date.now },
//           likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
//         },
//       ],
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
// });
// module.exports = mongoose.model("Post", postSchema);



//latest post schema for comments
const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  caption: { type: String, maxlength: 500 },
  images: [{ type: String }], 
  content: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // Store references to Comment documents
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);

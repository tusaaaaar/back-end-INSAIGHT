const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Post = require("../models/Post");
// const Users = require("../models/User"); // Import User model
const Users = require("../models/Usersmodel");
//const Comment = require("../models/Comment");
const Comment = require("../models/Comment");  // Ensure correct path


const router = express.Router();

// Set up storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "post_images", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });



router.post("/create", upload.array("images", 5), async (req, res) => {
  console.log("Create post was called by ");
  try {
    const { caption, userId, content } = req.body;


    // Get Cloudinary image URLs if uploaded
    const imageUrls = req.files?.length > 0 ? req.files.map((file) => file.path) : [];

    // Ensure the post has either an image or article text
    if (!content && imageUrls.length === 0) {
      return res.status(400).json({ error: "Post must contain either images or text content" });
    }

    const newPost = new Post({
      user: userId,
      caption,
      images: imageUrls, 
      content: content || null, // Only store if an article is posted
    });

    await newPost.save();
     // Update User Schema: Push the new post ID into user's posts array
   await Users.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

    res.status(201).json({ message: "Post created successfully", newPost });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get all posts by a user
// router.get("/user/:userId/posts", async (req, res) => {
//   console.log("User made get post request", req.params);
//   try {
//     const { userId } = req.params;

//     // Populate posts and include required fields
//     const user = await Users.findById(userId).populate({
//       path: "posts",
//       select: "caption images content createdAt", // Ensure all fields are included
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Ensure posts array is always returned, even if empty
//     res.status(200).json(user.posts || []);
//   } catch (error) {
//     console.error("Error fetching user posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
router.get("/user/:userId/posts", async (req, res) => {
  console.log("User made get post request", req.params);
  try {
    const { userId } = req.params;

    // Fetch user and populate posts with likes and comments
    const user = await Users.findById(userId).populate({
      path: "posts",
      populate: [
        { path: "likes", select: "username profilePicture" }, // Fetch users who liked the post
        {
          path: "comments",
          populate: { path: "user", select: "username profilePicture" }, // Fetch comments & user details
        },
      ],
      select: "caption images content createdAt likes comments",
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.posts || []);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//get all the saved posts of a user
// router.get("/user/:userId/saved",async(req,res)=>{
//   const {userId} = req.params;
//   console.log("USer mase request for his saved posts",userId);
//   try{
//     const user= await Users.findById(userId).populate("savedPosts");
//     if(!user)
//     {
//       return res.status(404).json({ error: "User not found" });
 
//     }
//     res.status(200).json(user.savedPosts || []);

//   }
//    catch (error) {
//     console.error("Error fetching user saved  posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
  
//   }
// });

router.get("/user/:userId/saved", async (req, res) => {
  const { userId } = req.params;
  console.log("User made request for their saved posts", userId);

  try {
    const user = await Users.findById(userId).populate({
      path: "savedPosts",
      populate: [
        {
          path: "user", // This populates the user who created the post
          select: "username profilePicture"
        },
        {
          path: "comments", // If you want full comments later
          select: "_id" // Just counting comments here
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Format posts to include the needed info
    const postsWithExtras = user.savedPosts.map(post => ({
      _id: post._id,
      caption: post.caption,
      images: post.images, // post media
      content: post.content,
      likesCount: post.likes?.length || 0,
      commentsCount: post.comments?.length || 0,
      postedBy: post.user, // populated user info
      createdAt: post.createdAt,
    }));

    res.status(200).json(postsWithExtras);
  } catch (error) {
    console.error("Error fetching user saved posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Fetch feed posts
// Fetch feed posts
// router.get("/feed/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const user = await Users.findById(userId).populate("following");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Fetch posts from following users
//     const posts = await Post.find({ user: { $in: user.following } })
//       .populate("user", "username profilePicture")
//       .sort({ createdAt: -1 });

//     // Check if post is saved and liked or not
//     const postsWithStatus = posts.map((post) => ({
//       ...post.toObject(),
//       isSaved: user.savedPosts.includes(post._id),
//       isLiked: post.likes.includes(userId),
//       profilePicUrl: `http://localhost:5000/files/${post.user.profilePicture}`,
//     }));

//     res.status(200).json(postsWithStatus);
//   } catch (error) {
//     console.error("Error fetching feed posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

//fetch feed including comments
router.get("/feed/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findById(userId).populate("following");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch posts from following users
    const posts = await Post.find({ user: { $in: user.following } })
      .populate("user", "username profilePicture")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username profilePic",
        },
      })
      .sort({ createdAt: -1 });

    // Check if post is saved and liked or not
    const postsWithStatus = posts.map((post) => ({
      ...post.toObject(),
      isSaved: user.savedPosts.includes(post._id),
      isLiked: post.likes.includes(userId),
      profilePicUrl: `http://localhost:5000/files/${post.user.profilePicture}`,
    }));

    res.status(200).json(postsWithStatus);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



//save posts 
router.post("/user/save/:userId/:postId",async(req,res)=>{
  const{userId,postId}=req.params;
  console.log("user wants the save a post ",userId,postId);
  try{
      const user=await Users.findById(userId);
      
      if(!user){
        
        return res.status(404).json({ error: "User not found" });
      }
       // Check if the post is already saved
    if (user.savedPosts.includes(postId)) {
      return res.status(201).json({ error: "Post already saved" ,savedPosts: user.savedPosts});
    }

    // Add post to savedPosts array
    await Users.findByIdAndUpdate(userId, {
      $push: { savedPosts: postId }
    });
    const userSavedPosts=await Users.findById(userId).populate("savedPosts");
    console.log("Post saved successfully",userSavedPosts);
    res.status(201).json({ message: "Post saved successfully",userSavedPosts });
    //instead send user to frontend and there if the post id is found in saved array then mark the post as saved 
  }catch(error){
    res.status(500).json({error:"Internal Server Error"})
  }
});


//unsave post
router.post("/user/unsave/:userId/:postId",async(req,res)=>{
  const {userId,postId}= req.params;
  console.log("user wants to unsave a post ",userId,postId);

  try{
      const user=await Users.findById(userId);
      if(!user){
        return res.status(404).json({error:"User not found"});
      }
      await Users.findByIdAndUpdate(userId,{$pull:{savedPosts:postId}});
      res.status(200).json({ message: "Post unsaved successfully" });
  }catch(error){
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.post("/user/like/:userId/:postId", async (req, res) => {
  const { userId, postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      // Unlike the post
      await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
    } else {
      // Like the post
      await Post.findByIdAndUpdate(postId, { $push: { likes: userId } });
    }

    res.status(201).json({ message: "Post liked/unliked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


///delete a post
router.delete("/delete/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    console.log("Post delete request received, ID:", postId);

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //  Delete images from Cloudinary (if they exist)
    if (post.images && post.images.length > 0) {
      for (const imageUrl of post.images) {
        // Extract public_id from the Cloudinary image URL
        const publicId = imageUrl.split("/").pop().split(".")[0]; 
        await cloudinary.uploader.destroy(publicId);
      }
      console.log("Post images deleted from Cloudinary");
    }

    //  Delete all comments related to the post
    await Comment.deleteMany({ _id: { $in: post.comments } });
    console.log("Post comments deleted");

    // Remove the post from users' saved posts list
    await Users.updateMany({}, { $pull: { savedPosts: postId } });
    console.log("Post removed from saved lists");
    
    // Remove post from the user's posts list**
    await Users.updateOne({ _id: post.user }, { $pull: { posts: postId } });
    console.log("Post removed from user's post list");

    //  Delete the post itself
    await Post.findByIdAndDelete(postId);
    console.log("Post deleted successfully");

    res.status(200).json({ message: "Post deleted successfully" });

  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//delete a post
//router.delete("")

//module.exports = router;


// //old working comments part

// //comment a post
// router.post("/:postId/comment", async (req, res) => {
//   const { postId } = req.params;
//   const { userId, text } = req.body;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: "Post not found" });

//     const newComment = {
//       user: userId,
//       text,
//       createdAt: new Date(),
//     };

//     post.comments.push(newComment);
//     await post.save();

//     console.log("post in comments ",post);

//     res.status(201).json({ message: "Comment added", post });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// //reply to a comment
// router.post("/:postId/comment/:commentId/reply", async (req, res) => {
//   const { postId, commentId } = req.params;
//   const { userId, text } = req.body;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: "Post not found" });

//     const comment = post.comments.find(c => c._id.toString() === commentId);
//     if (!comment) return res.status(404).json({ error: "Comment not found" });

//     const newReply = {
//       user: userId,
//       text,
//       createdAt: new Date(),
//     };

//     comment.replies.push(newReply);
//     await post.save();

//     res.status(201).json({ message: "Reply added", post });
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // DELETE Comment
// router.delete("/:postId/comment/:commentId/:userId", async (req, res) => {
//   const { postId, commentId, userId } = req.params;

//   try {
//     const post = await Post.findById(postId);
//     if (!post) return res.status(404).json({ error: "Post not found" });

//     // Find the comment to check if the user is the owner
//     const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
//     if (commentIndex === -1) return res.status(404).json({ error: "Comment not found" });

//     if (post.comments[commentIndex].user.toString() !== userId) {
//       return res.status(403).json({ error: "Unauthorized to delete this comment" });
//     }

//     // Remove the comment
//     post.comments.splice(commentIndex, 1);
//     await post.save();
    
//     res.status(200).json({ message: "Comment deleted successfully", post });
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// });


//new routes for comments

// router.post("/:postId/comments", async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const { userId, text } = req.body;

//     const newComment = new Comment({ post: postId, user: userId, text });
//     await newComment.save();

//     await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

//     res.status(201).json(newComment);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.post("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, text } = req.body;

    const newComment = new Comment({ post: postId, user: userId, text });
    await newComment.save();

    await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

    // ✅ Populate user details
    const populatedComment = await newComment.populate("user", "username profilePicture");

    // ✅ Convert to object & append profile picture URL
    const commentObject = populatedComment.toObject();
    commentObject.user.profilePicUrl = populatedComment.user.profilePicture
      ? `http://localhost:5000/files/${populatedComment.user.profilePicture}`
      : "default-profile-pic-url"; // Fallback

    console.log("Populated comment: ", commentObject);
    res.status(201).json(commentObject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//  Reply to a comment
// router.post("/comments/:commentId/replies", async (req, res) => {
//   try {
//     const { commentId } = req.params;
//     const { userId, text } = req.body;

//     // Find the parent comment and add a reply
//     const updatedComment = await Comment.findByIdAndUpdate(
//       commentId,
//       { $push: { replies: { user: userId, text, createdAt: new Date() } } }, // ✅ Add timestamp
//       { new: true }
//     ).populate("replies.user", "username profilePic");

//     if (!updatedComment) {
//       return res.status(404).json({ error: "Comment not found" });
//     }
// console.log(" checking for profilepic in comments ",updatedComment);
//     res.status(201).json(updatedComment);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// Reply to a comment
router.post("/comments/:commentId/replies", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, text } = req.body;

    // Find the parent comment and add a reply
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: { user: userId, text, createdAt: new Date() } } }, // ✅ Add timestamp
      { new: true }
    ).populate("replies.user", "username profilePicture"); // ✅ Populate user details

    if (!updatedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // ✅ Convert to object & append profile picture URL for each reply
    const commentObject = updatedComment.toObject();
    commentObject.replies = commentObject.replies.map((reply) => {
      return {
        ...reply,
        user: {
          ...reply.user,
          profilePicUrl: reply.user.profilePicture
            ? `http://localhost:5000/files/${reply.user.profilePicture}`
            : "default-profile-pic-url", // Fallback
        },
      };
    });

    console.log("Updated comment with profile pics in replies: ", commentObject);
    res.status(201).json(commentObject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all comments for a post
// router.get("/:postId/comments", async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const comments = await Comment.find({ post: postId }).populate("user", "username profilePicture").populate("replies.user", "username profilePicture");
//     console.log("Comments : ",comments);
//     res.status(200).json(comments);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
router.get("/:postId/comments", async (req, res) => {
  try {
    const { postId } = req.params;
    
    const comments = await Comment.find({ post: postId })
      .populate("user", "username profilePicture") // Populate main comment user
      .populate("replies.user", "username profilePicture"); // Populate reply users
    
    // ✅ Append profilePicUrl for each user in backend
    const updatedComments = comments.map((comment) => {
      const updatedComment = {
        ...comment.toObject(),
        user: {
          ...comment.user.toObject(),
          profilePicUrl: comment.user.profilePicture
            ? `http://localhost:5000/files/${comment.user.profilePicture}`
            : "default-profile-pic-url",
        },
        replies: comment.replies.map((reply) => ({
          ...reply.toObject(),
          user: {
            ...reply.user.toObject(),
            profilePicUrl: reply.user.profilePicture
              ? `http://localhost:5000/files/${reply.user.profilePicture}`
              : "default-profile-pic-url",
          },
        })),
      };
      return updatedComment;
    });

    console.log("Updated Comments:", updatedComments); // Debugging
    res.status(200).json(updatedComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//delete a comment
router.delete("/comments/:commentId/delete", async (req, res) => {
  try {
    const { commentId } = req.params;
    console.log("Delete request received for commentId:", commentId);

    // Find the comment by ID
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.replies.length > 0) {
      //  If it's a parent comment, delete all replies first
      await Comment.deleteMany({ _id: { $in: comment.replies.map(reply => reply._id) } });
      console.log("Deleted all replies for the parent comment:", comment.replies);
    }

    //  Delete the parent comment itself
    await Comment.findByIdAndDelete(commentId);
    console.log("Deleted parent comment:", commentId);

    //  Remove the comment from the Post's comments array
    await Post.findOneAndUpdate(
      { comments: commentId },
      { $pull: { comments: commentId } }
    );

    res.json({ message: "Comment and replies deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.delete("/comments/:commentId/replies/:replyId/delete", async (req, res) => {
  try {
    const { commentId, replyId } = req.params;
    console.log("delete reply was called ");
    // Find the comment that contains the reply
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Remove the reply from the replies array
    comment.replies = comment.replies.filter((reply) => reply._id.toString() !== replyId);
    await comment.save();
    console.log("ssenrttt");
    res.json({ message: "Reply deleted successfully", comment });
  } catch (error) {
    console.error("Error deleting reply:", error);
    res.status(500).json({ message: "Server error" });
  }
});









module.exports = router;

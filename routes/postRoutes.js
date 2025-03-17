const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Post = require("../models/Post");
// const Users = require("../models/User"); // Import User model
const Users = require("../models/Usersmodel");

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

// // Create a post with image upload
// router.post("/create", upload.array("images", 5), async (req, res) => {
//   console.log("Post creation route ");
//   try {
//     const { caption, userId } = req.body;
    
//     // Cloudinary URLs from uploaded files
//     const imageUrls = req.files.map((file) => file.path);

//     // Create new post
//     const newPost = new Post({
//       user: userId,
//       caption,
//       images: imageUrls, // Store Cloudinary image URLs
//     });

//     await newPost.save();

//     // ✅ Update User Schema: Push the new post ID into user's posts array
//     await Users.findByIdAndUpdate(userId, { $push: { posts: newPost._id } });

//     res.status(201).json({ message: "Post created successfully", newPost });
//   } catch (error) {
//     console.error("Error creating post:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



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
//   console.log("User made get post request ",req.params);
//   try {
//     const { userId } = req.params;
    

//     const user = await Users.findById(userId).populate("posts");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json(user.posts);
//   } catch (error) {
//     console.error("Error fetching user posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Get all posts by a user
router.get("/user/:userId/posts", async (req, res) => {
  console.log("User made get post request", req.params);
  try {
    const { userId } = req.params;

    // Populate posts and include required fields
    const user = await Users.findById(userId).populate({
      path: "posts",
      select: "caption images content createdAt", // Ensure all fields are included
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure posts array is always returned, even if empty
    res.status(200).json(user.posts || []);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get all the saved posts of a user
router.get("/user/:userId/saved",async(req,res)=>{
  const {userId} = req.params;
  console.log("USer mase request for his saved posts",userId);
  try{
    const user= await Users.findById(userId).populate("savedPosts");
    if(!user)
    {
      return res.status(404).json({ error: "User not found" });
 
    }
    res.status(200).json(user.savedPosts || []);

  }
   catch (error) {
    console.error("Error fetching user saved  posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  
  }
});


// //get all posts of the user following memebers to display in the feed
// router.get("/feed/:userId",async(req,res)=>{
//   console.log("Getting posts from users following list ");
//   try{
//     const {userId} =req.params;
//     console.log("USer who made feed req ",userId);
//     //find user & get their following list
//     const user = await Users.findById(userId).populate("following");

//     if(!user){
//       return res.status(404).json({error:"User not found"});
//     }

//     //get posts from the following list
//     const posts = await Post.find({user:{$in:user.following}})
//     .populate("user","username profilePicture")
//     .sort({createdAt:-1});//sort by newwest post first
//     console.log("fetched posts to be displayed in feed ",posts);

//     res.status(200).json(posts);
//   }catch(error){
//     console.error("Error fetching feed posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// })

// router.get("/feed/:userId", async (req, res) => {
//   console.log("Getting posts from users following list ");

//   try {
//     const { userId } = req.params;

//     // Find user & get their following list
//     const user = await Users.findById(userId).populate("following");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Get posts from the following list
//     const posts = await Post.find({ user: { $in: user.following } })
//       .populate("user", "username profilePicture") // Get profilePicture field
//       .sort({ createdAt: -1 });

//     // Convert posts to plain objects and attach profilePicUrl manually
//     const postsWithProfilePic = posts.map((post) => {
//       const postObj = post.toObject(); // Convert Mongoose document to plain object
//       postObj.profilePicUrl = `http://localhost:5000/files/${post.user.profilePicture}`;
//       return postObj;
//     });
//     console.log("fetched posts to be displayed in feed ",postsWithProfilePic);
//     res.status(200).json(postsWithProfilePic);
//   } catch (error) {
//     console.error("Error fetching feed posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Fetch feed posts
// Fetch feed posts
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


// router.get("/feed/:userId", async (req, res) => {
//   console.log("Getting posts from users following list ");

//   try {
//     const { userId } = req.params;
//     console.log("USERID ",userId);
//     // Find user & get their following list + savedPosts array
//     const user = await Users.findById(userId)
//       .populate("following")
//       .populate("savedPosts");

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Get posts from the following list
//     const posts = await Post.find({ user: { $in: user.following } })
//       .populate("user", "username profilePicture") // Get profilePicture field
//       .sort({ createdAt: -1 });

//     // Add isSaved and isLiked status to each post
//     const updatedPosts = posts.map((post) => ({
//       ...post._doc,
//       profilePicUrl: `http://localhost:5000/files/${post.user.profilePicture}`,
//       isSaved: user.savedPosts.includes(post._id), // Check if the post is saved
//       isLiked: post.likes.includes(userId), // Check if the post is liked
//       likeCount: post.likes.length // Count the likes
//     }));
   

//     console.log("fetched posts to be displayed in feed ", updatedPosts);
//     res.status(200).json(updatedPosts);

//   } catch (error) {
//     console.error("Error fetching feed posts:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



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

// //like a post
// router.post("/user/like/:userId/:postId",async(req,res)=>{
//   const {userId,postId}= req.params;
//   console.log("user wants to like the post ",userId,postId,);
  
//   try{
//     const user=await Users.findById(userId);
//     const post=await Post.findById(postId);
//     if(!user || !post)
//     {
//       return res.status(404).json({error:"User or post not found"});

//     }
//     if(post.likes.includes(userId)){
//       return res.status(201).json({ error: "Post already saved" ,updatedPost: user.likes});

//     }
//     const updatedPost = await Post.findByIdAndUpdate(postId, {
//       $push: { likes: userId }
//     }, { new: true });
//     console.log("updated post with likes ",updatedPost);
//     res.status(201).json({ message: "Post liked successfully", updatedPost });
//   }catch(error){
//     res.status(500).json({ error: "Internal Server Error" });

//   }
// });
// Like a post route
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





module.exports = router;

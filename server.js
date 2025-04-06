





const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bycrypt = require('bcryptjs');



//for pic
const multer = require("multer");
const path = require("path");

//for gridfs
const Grid =require('gridfs-stream');
// const { GridFsStorage } = require('multer-gridfs-storage');
const { GridFSBucket } = require('mongodb');
const conn =mongoose.connection;

let gfs, gridFSBucket;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("profilePictures"); // Store images in "profilePictures" collection
  gridFSBucket = new GridFSBucket(conn.db, { bucketName: "profilePictures" });
});
// Configure Multer for Uploads (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });




require('dotenv').config(); // For dotenv
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');

const Users = require('./models/Usersmodel');

const Post = require('./models/Post');
const { url } = require('inspector');

const app = express();

app.use(cors());
app.use(bodyParser.json());
// app.use(cookieParser());

// //from here new
// app.use(express.json());
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));  
// app.use(cookieParser());


// MongoDB connection
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

//storing image using filepath ....mutler
//   app.use("/uploads", express.static("uploads"));

// //upload of pic
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: (req, file, cb) => {
//     cb(null, req.params.username + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });



const postRoutes = require("./routes/postRoutes"); // Import post routes
app.use("/posts", postRoutes);  // Now "/api/posts/create" is accessible






//dont

// app.post("/uploadProfile/:username", upload.single("profilePicture"), async (req, res) => {
//   try {
//     const imageUrl = `/uploads/${req.file.filename}`;
//     await Users.updateOne({ username: req.params.username }, { profilePicture: imageUrl });
    
//     res.json({ imageUrl });
//   } catch (error) {
//     res.status(500).json({ message: "Error uploading profile picture" });
//   }
// });



// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

     console.log("while logging");       //for me to verify data
    console.log(user);
    console.log("Entered password:", password);
    console.log("Stored hashed password:", user.password);

    if (!user) {
      console.log("am i not?")
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bycrypt.compare(password, user.password);
   
     console.log("Password match result:", isMatch);
    if (isMatch) {
      console.log('passwords matched ');
      // console.log('did i reach inside if');

     


      return res.json({ message: "Login successful",user }); 
    } else {
      console.log("password error ig");
      return res.status(400).json({ message: "Incorrect password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// Signup Route
app.post('/signup', async (req, res) => {
  try {
    console.log(req.body);
    const { username, password, ...otherData } = req.body;

    // Check if the username already exists
    const existingUser = await Users.findOne({ username });
    console.log("while searching for users found this....");     //for me to verify data
      console.log(existingUser);
    if (existingUser) {
      console.log("USer found");    //for me to verify data
      console.log(existingUser);
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bycrypt.hash(password, 10);
    const userData = { username, password: hashedPassword, ...otherData };
    console.log(userData);

    // Create new user
    const user = await Users.create(userData);
    res.status(201).json({ message: "User created successfully", user: { username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user record", error: err.message });
  }
});




// app.put('/users/:username', async (req, res) => {
//   try {
//     const { username } = req.params;
//     let updates = req.body;

//     // Fetch existing user to prevent overwriting the password
//     const existingUser = await Users.findOne({ username });
//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // If the request does NOT contain a new password, keep the old one
//     if (!updates.password) {
//       updates.password = existingUser.password; // Retain old hashed password
//     } else {
//       // If a new password is provided, hash it before saving
//       const salt = await bycrypt.genSalt(10);
//       updates.password = await bycrypt.hash(updates.password, salt);
//     }

//     // Ensure `dateUpdatedAt` is updated
//     updates.dateUpdatedAt = new Date();

//     // Update user in database
//     const updatedUser = await Users.findOneAndUpdate(
//       { username },
//       { $set: updates },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (err) {
//     console.error("Error updating profile:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });



// //merged the upload pic and updated fields

// app.put('/users/:username', upload.single('profilePicture'), async (req, res) => {
//   try {
//     const { username } = req.params;
//     let updates = req.body;
//     console.log("The updated fields from the frontend are ",updates);

//     // Fetch the existing user
//     const existingUser = await Users.findOne({ username });
//     if (!existingUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Handle profile picture update if a file is uploaded
//     if (req.file) {
//       updates.profilePicture = `/uploads/${req.file.filename}`;
//     } else if (!existingUser.profilePicture) {
//       // Set default profile picture if none exists
//       updates.profilePicture = '/uploads/default-avatar.png';
//     }

//     // Handle password hashing if a new password is provided
//     if (updates.password) {
//       const salt = await bycrypt.genSalt(10);
//       updates.password = await bycrypt.hash(updates.password, salt);
//     } else {
//       // Retain the old password if not provided
//       updates.password = existingUser.password;
//     }

//     // Ensure dateUpdatedAt is set
//     updates.dateUpdatedAt = new Date();

//     // Update the user document
//     const updatedUser = await Users.findOneAndUpdate(
//       { username },
//       { $set: updates },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "Failed to update user" });
//     }

//     res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

//   } catch (err) {
//     console.error("Error updating profile:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });




// Update user profile, including profile picture
app.put('/users/:id', upload.single('profilePicture'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log("User ID is:", id);

    let updates = req.body;
    console.log("Updated fields from frontend:", updates);

    // Fetch the existing user
    const existingUser = await Users.findById(id);
    console.log("Existing user:", existingUser);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile picture update
    if (req.file) {
      try {
        // **Only delete old profile picture if it exists**
        if (existingUser.profilePicture) {
          try {
            const fileId = new mongoose.Types.ObjectId(existingUser.profilePicture);
            const files = await gridFSBucket.find({ _id: fileId }).toArray();

            if (files.length > 0) {
              await gridFSBucket.delete(fileId);
              console.log("Old profile picture deleted successfully.");
            }
          } catch (deleteError) {
            console.error("Error deleting old profile picture:", deleteError);
          }
        }

        // Upload new profile picture
        const writeStream = gridFSBucket.openUploadStream(req.file.originalname, {
          metadata: { username: existingUser.username }, //  Fixed undefined username
        });

        if (req.file && req.file.buffer) {
          writeStream.end(req.file.buffer);
        } else {
          console.error("No file buffer found");
          return res.status(400).json({ message: "No profile picture uploaded" });
        }

        const newFileId = await new Promise((resolve, reject) => {
          writeStream.on("finish", () => resolve(writeStream.id.toString()));
          writeStream.on("error", (error) => reject(error));
        });

        updates.profilePicture = newFileId;
      } catch (error) {
        console.error("Error handling profile picture update:", error);
        return res.status(500).json({ message: "Error updating profile picture" });
      }
    }

    // Handle password hashing if a new password is provided
    if (updates.password) {
      const salt = await bycrypt.genSalt(10);
      updates.password = await bycrypt.hash(updates.password, salt);
    } else {
      updates.password = existingUser.password;
    }

    // Ensure dateUpdatedAt is set
    updates.dateUpdatedAt = new Date();

    // Update the user document
    const updatedUser = await Users.findByIdAndUpdate(
      id,  
      { $set: updates },
      { new: true }
    );

    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      console.log("Update failed.");
      return res.status(404).json({ message: "Failed to update user" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});





// Route to retrieve profile picture from GridFS
app.get('/profilePictures/:id', async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const readStream = gridFSBucket.openDownloadStream(fileId);
    readStream.pipe(res);
    // console.log("inside route to retrieve profile picture");
  } catch (err) {
    res.status(404).json({ message: "Profile picture not found" });
  }
});


//for checking the password
{
  app.post('/users/:username/verify-password',async (req,res)=>{
    const {password}=req.body;
    const{username}=req.params;
    console.log("recieved password change from frontend ",password);
    try{
      const user= await Users.findOne({username});
      if(!user)
        {
          console.log("While checking for password match couldnt find the user");
          res.status(404).json({message:"user not found"});
        } 



      //compare current password with hashed 
      const IsMatch =await bycrypt.compare(password,user.password);
      if(!IsMatch){
        return res.status(400).json({success:false,message:" incorrect password"});

      }
      // const salt = new bycrypt
      res.status(200).json({message:"Password verified successfully"});

    }
    catch(error){
      console.log('Error verifying password:',error);
      res.status(500).json({message:'internal server error'})
    }
  })
};




//end point to serve images to frotendn
app.get("/files/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    console.log("Received from frontend, fileId:", fileId);

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ error: "Invalid file ID format" });
    }

    const bucket = new GridFSBucket(conn.db, { bucketName: "profilePictures" });

    const stream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    stream.on("error", (err) => {
      console.error("GridFS Stream Error:", err);
      return res.status(404).json({ error: "File not found" });
    });

    stream.pipe(res);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Error fetching file" });
  }
});







// //get user data 
// app.get("/users/:username",async(req,res)=>{
//   try{
//     const user = await Users.findOne({username:req.params.username});
//     if(!user) return res.status(404).json({error:"User Not Found"});
//     res.json(user);
//   }
//   catch(err){
//     res.status(500).json({error:err.message});
//   }
// });



// Route to get user data by ID
app.get("/users/:id", async (req, res) => {
  try {
    const id = decodeURIComponent(req.params.id); // Decode in case of special characters
    console.log("User ID fetched from frontend using GET:", id);

    const user = await Users.findById(id); // Fetch by ID

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Found user:", user);
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// app.put('/users/:username', async (req, res) => {
//   try {
//     const updates = req.body;
//     updates.dateUpdatedAt = new Date();

//     // If password is updated, hash it
//     if (updates.password) {
//       const salt = await bycrypt.genSalt(10);
//       updates.password = await bycrypt.hash(updates.password, salt);
//     }

//     // Find user by username and update fields
//     const updatedUser = await Users.findOneAndUpdate(
//       { username: req.params.username },
//       { $set: updates },
//       { new: true } //  Returns the updated user data
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: updatedUser, //  Send updated user data to frontend
//     });
//   } catch (err) {
//     console.error("Error updating profile:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// });





//fetch all users except the current logged in user

// app.get('/all/:userId', async (req, res) => {
//   try {
//     console.log("Find all users route was called.");
    
//     const userId = req.params.userId;
//     console.log("Received userId:", userId);

//     const users = await Users.find({ _id: { $ne: userId } }).select('username profilePicture');
    
//     console.log("All users fetched from backend:", users);
//     res.status(200).json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Error fetching users", error });
//   }
// });

app.get('/all/:userId', async (req, res) => {
  try {
    console.log("Fetching all users except followed ones...");
    const { userId } = req.params;

    // Find the logged-in user's following list
    const loggedInUser = await Users.findById(userId).select("following");

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all users **except** the logged-in user and those they already follow
    const users = await Users.find({
      _id: { $ne: userId, $nin: loggedInUser.following }, // Exclude logged-in user & followed users
    }).select("username profilePicture");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error });
  }
});


// //follow unfollow users
// app.post('/follow/:userId/:targetUserId', async (req, res) => {
//   try {
//     const { userId, targetUserId } = req.params;

//     // 🟢 Find users
//     const user = await Users.findById(userId);
//     const targetUser = await Users.findById(targetUserId);

//     if (!user || !targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 🟢 Toggle Follow/Unfollow
//     if (user.following.includes(targetUserId)) {
//       user.following = user.following.filter((id) => id !== targetUserId);
//       targetUser.followers = targetUser.followers.filter((id) => id !== userId);
//     } else {
//       user.following.push(targetUserId);
//       targetUser.followers.push(userId);
//     }

//     await user.save();
//     await targetUser.save();

//     res.status(200).json({ message: "Follow status updated" });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating follow status", error });
//   }
// });


//follow/unfollow
// app.post("/follow/:userId/:targetId", async (req, res) => {
//   console.log("users made follow unfolow request ");
//   const { userId, targetId } = req.params;

//   try {
//     const user = await Users.findById(userId);
//     const targetUser = await Users.findById(targetId);

//     if (!user || !targetUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isFollowing = user.following.includes(targetId);

//     if (isFollowing) {
//       // If already following, unfollow
//       user.following = user.following.filter((id) => id.toString() !== targetId);
//       targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);
//     } else {
//       // Otherwise, follow
//       user.following.push(targetId);
//       targetUser.followers.push(userId);
//     }

//     await user.save();
//     await targetUser.save();

//     res.status(200).json({ isFollowing: !isFollowing });
//   } catch (error) {
//     console.error("Error updating follow status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
app.post("/follow/:userId/:targetId", async (req, res) => {
  console.log("Users made follow/unfollow request");

  try {
    
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const targetId = new mongoose.Types.ObjectId(req.params.targetId);

    console.log(userId, " wants to follow/unfollow ", targetId);

    const user = await Users.findById(userId);
    const targetUser = await Users.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.following.includes(targetId);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter((id) => !id.equals(targetId));
      targetUser.followers = targetUser.followers.filter((id) => !id.equals(userId));
    } else {
      // Follow
      user.following.push(targetId);
      targetUser.followers.push(userId);
    }

    await user.save();
    await targetUser.save();

    res.status(200).json({ isFollowing: !isFollowing });
  } catch (error) {
    console.error("Error updating follow status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});





// // 🟢 Get full user details by ID (without Router)
// app.get("/user/:userId", async (req, res) => {
//   try {
//     console.log("username in mini users ",req.params.userId);
//     const user = await Users.findById(req.params.userId).populate("followers following", "username profilePic");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.status(200).json({
//       _id: user._id,
//       username: user.username,
//       profilePicture: user.profilePic,
//       bio: user.bio,
//       posts: user.posts,
//       followers: user.followers,
//       following: user.following,
//       isFollowing: false, // Set in frontend based on logged-in user
//     });
//   } catch (error) {
//     console.error("Error fetching user profile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// // Route to get followers list
// app.get("/user/:id/followers", async (req, res) => {
//   console.log("followers request made by id", req.params.id);

//   try {
//     const user = await Users.findById(req.params.id).populate("followers", "username profilePicture");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     console.log("User's followers list:", user.followers);
//     res.status(200).json(user.followers);

//   } catch (error) {
//     console.error("Error while searching for followers list:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });



//followers list
app.get("/user/:id/followers", async (req, res) => {
  console.log("Fetching followers for user ID:", req.params.id);

  try {
    // Fetch the logged-in user (whose followers we are viewing)
    const user = await Users.findById(req.params.id)
      .populate("followers", "username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    // `user.followers` contains all users following the logged-in user.
    // Check if the logged-in user follows each of them.
    const followersList = user.followers.map((follower) => ({
      _id: follower._id,
      username: follower.username,
      profilePicture: follower.profilePicture,
      isFollowing: user.following.includes(follower._id), // Check if user follows them
    }));

    console.log("User's followers list:", followersList);
    res.status(200).json(followersList);

  } catch (error) {
    console.error("Error while fetching followers list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// //route to get following list
// app.get("/user/:id/following", async (req, res) => {
//   console.log("following request made by id", req.params.id);

//   try {
//     const user = await Users.findById(req.params.id).populate("following", "username profilePicture");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     console.log("User's following list:", user.following);
//     res.status(200).json(user.following);

//   } catch (error) {
//     console.error("Error while searching for following list:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

//following list with isfollowing
app.get("/user/:id/following", async (req, res) => {
  console.log("Following request made by id:", req.params.id);

  try {
    const user = await Users.findById(req.params.id)
      .populate("following", "username profilePicture");

    if (!user) return res.status(404).json({ message: "User not found" });

    // `user.following` contains the users that the logged-in user is following.
    const followingList = user.following.map((followingUser) => ({
      _id: followingUser._id,
      username: followingUser.username,
      profilePicture: followingUser.profilePicture,
      isFollowing: true, // Always true, because this is the "following" list
    }));

    console.log("User's following list:", followingList);
    res.status(200).json(followingList);

  } catch (error) {
    console.error("Error while fetching following list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




// //following list route
// app.get("/user/:id/following", async (req, res) => {
//   console.log("Following request made by user ID:", req.params.id);

//   try {
//     // Fetch the logged-in user (whose following list we are viewing)
//     const user = await Users.findById(req.params.id)
//       .populate("following", "username profilePicture");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // `user.following` contains all users the logged-in user is following.
//     // Check if each of these users also follows the logged-in user (mutual follow).
//     const followingList = user.following.map((followedUser) => ({
//       _id: followedUser._id,
//       username: followedUser.username,
//       profilePicture: followedUser.profilePicture,
//       isFollowing: user.followers.includes(followedUser._id), // Check if mutual follow
//     }));

//     console.log("User's following list:", followingList);
//     res.status(200).json(followingList);

//   } catch (error) {
//     console.error("Error while fetching following list:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// Search route
app.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const users = await Users.find({
      $or: [
        { username: { $regex: `^${query}`, $options: "i" } }, // Case-insensitive username search
        { name: { $regex: `^${query}`, $options: "i" } } // Case-insensitive name search
      ]
    }).select("username name profilePicture"); // Ensure 'name' field exists in the model

    res.json(users);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const ecoRoute = require("./routes/ecoRoutes");
const { MongoUnexpectedServerResponseError } = require('mongodb');
app.use("/api/eco",ecoRoute);


// Example route
app.get('/profile/:id', async (req, res) => {
  console.log("Get user profile on click was called");
  const userId = req.params.id;

  try {
    // Fetch user details (excluding password)
    const user = await Users.findById(userId)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');

    // Fetch posts made by this user
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('likes', 'username')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username profilePicture'
        }
      });

    const followersCount = user.followers.length;
    const followingCount = user.following.length;
    const postCount = posts.length;

    // Send full profile object
    res.json({
      user,
      posts,
      followersCount,
      followingCount,
      postCount
    });

  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: 'Something went wrong while fetching profile' });
  }
});












// Base route
app.get('/', (req, res) => {
  res.send('Backend is Working!');
});






app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

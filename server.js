// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const bycrypt = require('bcryptjs');

// require('dotenv').config(); // For dotenv
// // const jwt = require('jsonwebtoken');
// // const cookieParser = require('cookie-parser');


// //for pic
// const multer = require("multer");
// const path = require("path");

// const Users = require('./models/Usersmodel');

// const app = express();

// app.use(cors());
// app.use(bodyParser.json());
// // app.use(cookieParser());

// // //from here new
// // app.use(express.json());
// // app.use(cors({ origin: 'http://localhost:3000', credentials: true }));  
// // app.use(cookieParser());


// // MongoDB connection
// mongoose.connect(process.env.MONGO_DB, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((error) => {
//     console.error("MongoDB connection error:", error);
//   });






// // Login Route
// app.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await Users.findOne({ username });

//     // console.log("while logging");       //for me to verify data
//     // console.log(user);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const isMatch = await bycrypt.compare(password, user.password);
//     if (isMatch) {
//       // console.log('inside if');
//       // console.log('did i reach inside if');

     


//       return res.json({ message: "Login successful" }); 
//     } else {
//       return res.status(400).json({ message: "Incorrect password" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error", error: err.message });
//   }
// });

// // Signup Route
// app.post('/signup', async (req, res) => {
//   try {
//     console.log(req.body);
//     const { username, password, ...otherData } = req.body;

//     // Check if the username already exists
//     const existingUser = await Users.findOne({ username });
//     console.log("while searching for users found this....");     //for me to verify data
//       console.log(existingUser);
//     if (existingUser) {
//       console.log("USer found");    //for me to verify data
//       console.log(existingUser);
//       return res.status(400).json({ message: "Username already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bycrypt.hash(password, 10);
//     const userData = { username, password: hashedPassword, ...otherData };
//     console.log(userData);

//     // Create new user
//     const user = await Users.create(userData);
//     res.status(201).json({ message: "User created successfully", user: { username: user.username } });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating user record", error: err.message });
//   }
// });

// //Route to get user data by username
// app.get("/users/:username", async (req, res) => {
//   try {
//     const username = decodeURIComponent(req.params.username); // Decode in case of special characters
//     console.log("username  fetched  from frontend using get ",username);
//     const user = await Users.findOne({ username: username });
//     console.log("found this user: ",user);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({user});
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });



// app.use("/uploads", express.static("uploads"));

// //upload of pic
// const storage = multer.diskStorage({
//   destination: "./uploads/",
//   filename: (req, file, cb) => {
//     cb(null, req.params.username + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage });

// app.post("/uploadProfile/:username", upload.single("profilePicture"), async (req, res) => {
//   try {
//     const imageUrl = `/uploads/${req.file.filename}`;
//     await Users.updateOne({ username: req.params.username }, { profilePicture: imageUrl });
    
//     res.json({ imageUrl });
//   } catch (error) {
//     res.status(500).json({ message: "Error uploading profile picture" });
//   }
// });














// // Base route
// app.get('/', (req, res) => {
//   res.send('Backend is Working!');
// });






// app.listen(5000, () => {
//   console.log("Server is running on http://localhost:5000");
// });





const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bycrypt = require('bcryptjs');

//for pic
const multer = require("multer");
const path = require("path");



require('dotenv').config(); // For dotenv
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');

const Users = require('./models/Usersmodel');

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


  app.use("/uploads", express.static("uploads"));

//upload of pic
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, req.params.username + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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

     


      return res.json({ message: "Login successful" }); 
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




//merged the upload pic and updated fields

app.put('/users/:username', upload.single('profilePicture'), async (req, res) => {
  try {
    const { username } = req.params;
    let updates = req.body;
    console.log("The updated fields from the frontend are ",updates);

    // Fetch the existing user
    const existingUser = await Users.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle profile picture update if a file is uploaded
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    } else if (!existingUser.profilePicture) {
      // Set default profile picture if none exists
      updates.profilePicture = '/uploads/default-avatar.png';
    }

    // Handle password hashing if a new password is provided
    if (updates.password) {
      const salt = await bycrypt.genSalt(10);
      updates.password = await bycrypt.hash(updates.password, salt);
    } else {
      // Retain the old password if not provided
      updates.password = existingUser.password;
    }

    // Ensure dateUpdatedAt is set
    updates.dateUpdatedAt = new Date();

    // Update the user document
    const updatedUser = await Users.findOneAndUpdate(
      { username },
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update user" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
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



//Route to get user data by username
app.get("/users/:username", async (req, res) => {
  try {
    const username = decodeURIComponent(req.params.username); // Decode in case of special characters
    console.log("username  fetched  from frontend using get ",username);
    const user = await Users.findOne({ username: username });
    console.log("found this user: ",user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({user});
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.put('/users/:username', async (req, res) => {
  try {
    const updates = req.body;
    updates.dateUpdatedAt = new Date();

    // If password is updated, hash it
    if (updates.password) {
      const salt = await bycrypt.genSalt(10);
      updates.password = await bycrypt.hash(updates.password, salt);
    }

    // Find user by username and update fields
    const updatedUser = await Users.findOneAndUpdate(
      { username: req.params.username },
      { $set: updates },
      { new: true } //  Returns the updated user data
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser, //  Send updated user data to frontend
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});





//update user data





// Base route
app.get('/', (req, res) => {
  res.send('Backend is Working!');
});






app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

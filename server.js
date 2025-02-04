const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bycrypt = require('bcryptjs');

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






// Login Route
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });

    // console.log("while logging");       //for me to verify data
    // console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bycrypt.compare(password, user.password);
    if (isMatch) {
      // console.log('inside if');
      // console.log('did i reach inside if');

     


      return res.json({ message: "Login successful" }); 
    } else {
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




// Base route
app.get('/', (req, res) => {
  res.send('Backend is Working!');
});






app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

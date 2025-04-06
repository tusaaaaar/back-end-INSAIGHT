const express = require("express");

const router = express.Router();

const ecoData = {
  wasteData: {
    months: ["Jan", "Feb", "Mar", "Apr"],
    bigPlastic: [40, 35, 45, 50], // sample values based on "big wrappers"
    smallPlastic: [15, 30, 32, 35], // "small wrappers"
    otherWaste: [5, 10, 15,9], // paper, food waste, etc.
  },
  
  updates: [
    {
      title: "Plogging & Waste Segregation Drive",
      date: "2025-01-15",
      details: "Collected and segregated wrappers during plogging.",
    },
    {
      title: "Awareness Session on Segregation",
      date: "2025-02-20",
      details: "Educated students using color-coded bins and posters.",
    },
   
    {
      title: "Foyer Session",
      date: "2025-04-01",
      details: "Talked about benefits of waste segregation and future vision.",
    }
  ],
  events: [
    {
      name: "Plogging Drive ",
      date: "2025-01-10",
      details: "Segregation of collected waste by Eco Club members.",
    },
    {
      name: "Foyer Session on Waste Segregation",
      date: "2025-04-01",
      details: "Interactive session to promote segregation habits.",
    },
    {
      name: "Distribution of Buckets to Nearby School",
      date: "2025-03-25",
      details: "Buckets made from recycled materials were distributed.",
    },
    {
      name: "Paper Bag Making Drive",
      date: "2025-03-10",
      details: "Made paper bags from waste paper for reuse.",
    }
  ]
  ,
  quotes: [
    "Segregate today for a better tomorrow.",
    "Don’t trash our future — segregate waste!",
    "Plogging is caring.",
    "Clean surroundings, clear mind.",
    "Be the change, start with waste segregation."
  ],  
};

// GET Eco Einstein data (serving static data)
router.get("/", async (req, res) => {
  try {
    res.json(ecoData); // Directly sending static data
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

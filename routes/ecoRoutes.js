const express = require("express");

const router = express.Router();

const ecoData = {
  wasteData: {
    months: ["Jan", "Feb", "Mar", "Apr"],
    bigPlastic: [30, 40, 35],
    smallPlastic: [15, 20, 25],
    otherWaste: [5, 10, 15],
  },
  updates: [
    {
      title: "Plogging 2.0",
      date: "2025-03-01",
      details: "Planted 50 trees",
    },
    {
      title: "Workshop by Vasukee",
      date: "2025-03-15",
      details: "Educated students on waste segregation",
    },
  ],
  events: [
    {
      name: "Making PAPER BAGS",
      date: "2025-03-10",
      details: "Campus cleaning event",
    },
    {
      name: "Making Bucket to be given in nearby school",
      date: "2025-03-25",
      details: "Guest lecture on sustainability",
    },
  ],
  quotes: [
    "Save trees, save Earth!",
    "Reduce, Reuse, Recycle",
    "A greener planet starts with you!",
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

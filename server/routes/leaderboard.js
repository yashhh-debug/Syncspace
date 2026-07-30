import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json([
      {
        username: "Demo User",
        score: 0
      }
    ]);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
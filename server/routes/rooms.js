import express from "express";

const router = express.Router();

// Create room
router.post("/", async (req, res) => {
  try {
    const { roomId } = req.body;

    res.status(201).json({
      success: true,
      roomId,
      message: "Room created successfully"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// Join room
router.get("/:id", async (req, res) => {
  try {
    res.json({
      success: true,
      roomId: req.params.id
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
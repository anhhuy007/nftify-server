const stampController = require("../controllers/stamp.controller");
const express = require("express");
const itemRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

itemRouter.get("/list", stampController.getStamps);
itemRouter.get("/list/trending", stampController.getTredingStamp);
itemRouter.get("/:id", stampController.getStampById);

// only authenticated users can create a new stamp
itemRouter.post("/", authenticateToken, stampController.createStamp);

itemRouter.delete("/:id", stampController.deleteStamp);

module.exports = itemRouter;

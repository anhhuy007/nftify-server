const stampController = require("../controllers/stamp.controller");
const express = require("express");
const itemRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
itemRouter.get("/list", stampController.getStamps);
itemRouter.get("/list/trending", stampController.getTredingStamp);
itemRouter.get("/:id", stampController.getStampById);

// authenticated-required routes
itemRouter.use(authenticateToken);
itemRouter.post("/", stampController.createStamp);
itemRouter.delete("/:id", stampController.deleteStamp);
itemRouter.get("/increment-view/:id", stampController.increaseStampView);
itemRouter.get("/increment-favourite/:id", stampController.increaseStampFavourite);

module.exports = itemRouter;

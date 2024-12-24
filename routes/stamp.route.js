const stampController = require("../controllers/stamp.controller");
const express = require("express");
const itemRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
itemRouter.get("/list", stampController.getStamps);
itemRouter.get("/list/trending", stampController.getTrendingStamp);
itemRouter.get("/list/:creatorId", stampController.getStampsByCreator);
itemRouter.get("/:id", stampController.getStampById);
itemRouter.get("/:id/detail", stampController.getStampDetails);

// authenticated-required routes
itemRouter.use(authenticateToken);
itemRouter.post("/", stampController.createStamp);
itemRouter.delete("/:id", stampController.deleteStamp);
itemRouter.get("/increment-view/:id", stampController.increaseStampView);
itemRouter.get("/increment-favourite/:id", stampController.increaseStampFavourite);

// create

module.exports = itemRouter;

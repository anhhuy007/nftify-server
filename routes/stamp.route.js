const stampController = require("../controllers/stamp.controller");
const express = require("express");
const itemRouter = express.Router();

itemRouter.get("/list", stampController.getStamps);
itemRouter.get("/list/trending", stampController.getTredingStamp);
itemRouter.get("/:id", stampController.getStampById);
itemRouter.post("/", stampController.createStamp);
itemRouter.delete("/:id", stampController.deleteStamp);

module.exports = itemRouter;

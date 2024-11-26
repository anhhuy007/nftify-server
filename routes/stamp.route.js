const stampController = require("../controllers/stamp.controller");
const express = require("express");
const itemRouter = express.Router();

// itemRouter.post("/", stampController.createItem);

// Create the route-handler callback functions
itemRouter.get("/", function (req, res) {
  res.send("this is stamps route");
});

itemRouter.get("/list", stampController.getStamps);
itemRouter.get("/topItems", stampController.getTredingStamp);
itemRouter.get("/:id", stampController.getStampById);

module.exports = itemRouter;

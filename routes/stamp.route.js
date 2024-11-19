const stampController = require("../controllers/stamp.controller");
const express = require("express");
const itemRouter = express.Router();

itemRouter.post("/", stampController.createItem);

// Create the route-handler callback functions
itemRouter.get("/", function (req, res) {
  res.send("this is stamps route");
});

itemRouter.get("/list", stampController.getAllItems);
itemRouter.get("/timeFilter", stampController.itemFilteredDate);
itemRouter.get("/titleFilter", stampController.itemFilteredTitle);
itemRouter.get("/denomFilter", stampController.itemFilteredDenom);
itemRouter.get("/topItems", stampController.getTopItems);
itemRouter.get("/:id", stampController.getByID);

module.exports = itemRouter;

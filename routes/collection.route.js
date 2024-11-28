const express = require("express");
const collectionRouter = express.Router({ mergeParams: true });
const collectionController = require("../controllers/collection.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// displaying 
collectionRouter.get("/list", collectionController.getCollections);
collectionRouter.get("/list/trending", collectionController.getTredingCollections);
collectionRouter.get("/:collectionId", collectionController.getCollectionById);

// user actions
collectionRouter.get("/increment-view/:collectionId", authenticateToken, collectionController.increaseViewCount);
collectionRouter.get("/increment-favourite/:collectionId", authenticateToken, collectionController.increaseFavouriteCount);
collectionRouter.post("/", authenticateToken, collectionController.createCollection);
// collectionRouter.put("/:collectionId", collectionController.updateCollection);
// collectionRouter.delete("/:collectionId", collectionController.deleteCollection);

module.exports = collectionRouter;
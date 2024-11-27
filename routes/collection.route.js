const express = require("express");
const collectionRouter = express.Router({ mergeParams: true });
const collectionController = require("../controllers/collection.controller");

collectionRouter.get("/increment-view/:collectionId", collectionController.increaseViewCount);
collectionRouter.get("/increment-favourite/:collectionId", collectionController.increaseFavouriteCount);
collectionRouter.get("/list", collectionController.getCollections);
collectionRouter.get("/list/trending", collectionController.getTredingCollections);
collectionRouter.get("/:collectionId", collectionController.getCollectionById);
// collectionRouter.post("/", collectionController.createCollection);
// collectionRouter.put("/:collectionId", collectionController.updateCollection);
// collectionRouter.delete("/:collectionId", collectionController.deleteCollection);

module.exports = collectionRouter;
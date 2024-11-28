const express = require("express");
const collectionRouter = express.Router({ mergeParams: true });
const collectionController = require("../controllers/collection.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
collectionRouter.get("/list", collectionController.getCollections);
collectionRouter.get("/list/trending", collectionController.getTredingCollections);
collectionRouter.get("/:collectionId", collectionController.getCollectionById);

// authenticated-required routes
collectionRouter.use(authenticateToken);
collectionRouter.get("/increment-view/:collectionId", collectionController.increaseViewCount);
collectionRouter.get("/increment-favourite/:collectionId", collectionController.increaseFavouriteCount);
collectionRouter.post("/", collectionController.createCollection);
collectionRouter.patch("/:collectionId", collectionController.updateCollection);
collectionRouter.delete("/:collectionId", collectionController.deleteCollection);

module.exports = collectionRouter;
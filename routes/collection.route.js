const express = require("express");
const collectionRouter = express.Router({ mergeParams: true });
const collectionController = require("../controllers/collection.controller");

collectionRouter.get("/list", collectionController.getCollections);
collectionRouter.get("/:collectionId", collectionController.getCollectionById);
collectionRouter.post("/", collectionController.createCollection);
collectionRouter.put("/:collectionId", collectionController.updateCollection);

module.exports = collectionRouter;
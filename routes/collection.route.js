const express = require("express");
const collectionRouter = express.Router({ mergeParams: true });
const collectionController = require("../controllers/collection.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
// NOT IN USED, USE MARKETPLACE ROUTES INSTEAD
collectionRouter.get("/list", collectionController.getCollections);
collectionRouter.get("/list/trending", collectionController.getTrendingCollections);
collectionRouter.get("/:collectionId", collectionController.getCollectionById);
// collectionRouter.get("/:collectionId/detail", collectionController.getColectionDetails);
collectionRouter.get("/:collectionId/stamp", collectionController.getCollectionStamps);


//collection detail page 
collectionRouter.get("/:id/about", collectionController.getCollectionAbout);
collectionRouter.get("/:id/items", collectionController.getCollectionItems);


// authenticated-required routes
collectionRouter.use(authenticateToken);


collectionRouter.get("/increment-view/:collectionId", collectionController.increaseViewCount);
collectionRouter.get("/increment-favourite/:collectionId", collectionController.increaseFavouriteCount);

collectionRouter.post("/create", collectionController.createCollection);

collectionRouter.patch("/:collectionId", collectionController.updateCollection);
collectionRouter.delete("/:collectionId", collectionController.deleteCollection);


module.exports = collectionRouter;
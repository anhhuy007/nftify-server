const userController = require("../controllers/user.controller");
const express = require("express");
const userRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
userRouter.get("list", userController.getUsers);
userRouter.get("/find", userController.getUsers);
userRouter.get("/profile/:userId", userController.getUserByID);
userRouter.get("/profile/:userId/collections", userController.getUserCollections);
userRouter.get("/profile/:userId/on-sale", userController.getItemsOnSale);
userRouter.get("/profile/:userId/created", userController.getCreatedStamps);
userRouter.get("/profile/:userId/owned", userController.getOwnedStamps);
userRouter.get("/profile/:userId/favourite", userController.getFavouriteStamps);

// authenticated-required routes
userRouter.use(authenticateToken);

// CRUD routes
userRouter.get("/", userController.getUser);
userRouter.post('/init-wallet', userController.initWallet);
userRouter.put("/profile/", userController.updateUser);
userRouter.post("/create", userController.createUser);
userRouter.delete("/delete/", userController.deleteUser);

// NFTs routes
userRouter.post("/create/nft", userController.createNewStamp);
userRouter.post("/edit/nft/:_id", userController.editStamp);  
userRouter.delete("/delete/nft/:_id", userController.deleteStamp);

userRouter.get("/myNfts", userController.getMyNFTs);
userRouter.post("/connect-wallet", userController.connectWallet);

//setting page
userRouter.get("/settings", userController.getUserSettings);
userRouter.post("/settings/upload", userController.changeUserProfile);
userRouter.post("/settings/check-password", userController.checkPassword);
userRouter.post("/settings/change-password", userController.changePassword);
userRouter.post("/settings/change-email", userController.changeEmail);

// Cart routes
userRouter.get("/cart", userController.getCart);
userRouter.post("/cart", userController.addToCart);
userRouter.delete("/cart", userController.removeFromCart);
userRouter.post("/cart/checkout", userController.checkoutCart);
userRouter.delete("/cart/clear", userController.clearCart);

// create nft
userRouter.get("/collectionList", userController.getCollectionList);

// create collection
userRouter.post("/collection/create", userController.createCollection);
userRouter.delete("/collection/delete/:_id", userController.deleteCollection);

module.exports = userRouter;


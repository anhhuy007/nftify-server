const userController = require("../controllers/user.controller");
const express = require("express");
const userRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
userRouter.get("list", userController.getUsers);

userRouter.get("/find", userController.getUsers);

// @route   GET /api/v1/user/profile/:userId
// @desc    get user profile
// http://localhost:3000/api/v1/user/profile/673876c24af03358be502d7b
userRouter.get("/profile/:userId", userController.getUserByID);

// @route   GET /api/v1/user/profile/:userId/collections
// @desc    get user collections
// http://localhost:3000/api/v1/user/profile/673876c24af03358be502d7b/collections
userRouter.get("/profile/:userId/collections", userController.getUserCollections);
// @route   GET /api/v1/user/profile/:userId/onSale
// @desc    get user items on sale
// http://localhost:3000/api/v1/user/profile/673876c24af03358be502d7b/onSale
userRouter.get("/profile/:userId/on-sale", userController.getItemsOnSale);

// @route   GET /api/v1/user/display/:userId/created
// @desc    get created stamps by user
// http://localhost:3000/api/v1/user/profile/67387693db2193ef3c0c6b46/created
// http://localhost:3000/api/v1/user/profile/67387693db2193ef3c0c6b46/created?minDenom=70&maxDenom=&color=multicolored&function=&page=1&limit=10&sortBy=denom&sortOrder=-55
userRouter.get("/profile/:userId/created", userController.getCreatedStamps);

// @route   GET /api/v1/user/profile/:userId/owned
// @desc    get owned stamps by user
// http://localhost:3000/api/v1/user/profile/67387693db2193ef3c0c6b46/owned
userRouter.get("/profile/:userId/owned", userController.getOwnedStamps);

// @route   GET /api/v1/user/profile/:userId/favourite
// @desc    get favourite stamps by user
// http://localhost:3000/api/v1/user/display/67387693db2193ef3c0c6b46/favourite
userRouter.get("/profile/:userId/favourite", userController.getFavouriteStamps);

// authenticated-required routes

userRouter.use(authenticateToken);
userRouter.get("/", userController.getUser);
userRouter.put("/profile/", userController.updateUser);
userRouter.post("/create", userController.createUser);
userRouter.delete("/delete/", userController.deleteUser);

// NFTs routes
userRouter.post("/create/nft", userController.createNewStamp);
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

module.exports = userRouter;


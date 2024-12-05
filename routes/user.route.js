const userController = require("../controllers/user.controller");
const express = require("express");
const userRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes


userRouter.get("list", userController.getUsers);
// @route   GET /api/v1/user/profile
// @desc    Get user profile
// http://localhost:3000/api/v1/user/profile/673876c24af03358be502d7b
userRouter.get("/profile/:userId", userController.getUserByID);
// @route   GET /api/v1/user/profile
// @desc    find user profile from name filter
// http://localhost:3000/api/v1/user/find?name=alice
userRouter.get("/find", userController.getUsers);


// @route   GET /api/v1/user/display/:userId/created
// @desc    get created stamps by user
// http://localhost:3000/api/v1/user/display/67387693db2193ef3c0c6b46/created
// http://localhost:3000/api/v1/user/display/67387693db2193ef3c0c6b46/created?minDenom=70&maxDenom=&color=multicolored&function=&page=1&limit=10&sortBy=denom&sortOrder=-55
userRouter.get("/display/:userId/created", userController.getCreatedStamps);


// @route   GET /api/v1/user/display/:userId/created
// @desc    get created stamps by user
// http://localhost:3000/api/v1/user/display/67387693db2193ef3c0c6b46/owned?
// http://localhost:3000/api/v1/user/display/67387693db2193ef3c0c6b46/owned?minDenom=70&maxDenom=&color=multicolored&function=&page=1&limit=10&sortBy=denom&sortOrder=
userRouter.get("/display/:userId/owned", userController.getOwnedStamps);

// @route   GET /api/v1/user/display/:userId/created
// @desc    get favourite stamps by user
// http://localhost:3000/api/v1/user/display/67387693db2193ef3c0c6b46/favourite?
userRouter.get("/display/:userId/favourite", userController.getFavouriteStamps);

// authenticated-required routes
// userRouter.use(authenticateToken);
userRouter.put("/profile/:userId", userController.updateUser);
userRouter.post("/create", userController.createUser);
userRouter.delete("/delete/:userId", userController.deleteUser);

// NFTs routes
userRouter.post("/create/nft", userController.createNewStamp);
userRouter.get("/myNfts", userController.getMyNFTs);

module.exports = userRouter;


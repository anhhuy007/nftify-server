const userController = require("../controllers/user.controller");
const express = require("express");
const userRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
userRouter.get("list", userController.getUsers);
userRouter.get("/profile/:userId", userController.getUserByID);
userRouter.get("/find", userController.getUsers);
userRouter.get("/display/:userId/created", userController.getCreatedStamps);
userRouter.get("/display/:userId/owned", userController.getOwnedStamps);
userRouter.get("/display/:userId/favourite", userController.getFavouriteStamps);

// authenticated-required routes

userRouter.use(authenticateToken);
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


module.exports = userRouter;


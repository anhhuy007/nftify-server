const userController = require("../controllers/user.controller");
const express = require("express");
const userRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
userRouter.get("/profile/:userId", userController.getUserByID);
userRouter.get("/find", userController.getUsers);

// authenticated-required routes
userRouter.use(authenticateToken);
userRouter.put("/profile/:userId", userController.updateUser);
userRouter.post("/create", userController.createUser);
userRouter.delete("/delete/:userId", userController.deleteUser);

// NFTs routes
userRouter.post("/create/nft", userController.createNewStamp);

module.exports = userRouter;


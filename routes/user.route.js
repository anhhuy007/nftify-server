const userController = require("../controllers/user.controller");
const collectionRouter = require("./collection.route");
const express = require("express");
const userRouter = express.Router();

userRouter.use("/:id/collection", collectionRouter);

//user routes
userRouter.get("/", userController.getAllUser);

userRouter.get("/:id/lists", userController.getAllItems);
userRouter.get("/:id", userController.getByID);

//jwt

module.exports = userRouter;

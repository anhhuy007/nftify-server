const userController = require("../controllers/user.controller");
const express = require("express");
const userRouter = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
userRouter.get("/", async (req, res) => {
    try {
        res.send("hello user");
    } catch (error) {
        console.error("Error handling the request:", error);
        res.status(500).send("An error occurred.");
    }
});
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


// authenticated-required routes
userRouter.use(authenticateToken);
// @route   PUT /api/v1/user/profile
// @desc    Update user profile
// http://localhost:3000/api/v1/user/profile/674978182a0891c02e589943

// {
//     "name" : "quan122",
//     "description" : "hello22",
//     "avatarUrl" : "default22.image",
//     "gender" :"male"
// }
userRouter.put("/profile/:userId", userController.updateUser);


// @route   GET /api/v1/user/create
// @desc    create user profile
// http://localhost:3000/api/v1/user/create
// {
//     "name" : "quan2",
//     "description" : "hello",
//     "avatarUrl" : "default.image",
//     "gender" :"female",
//     "status": "rejected"
// }
userRouter.post("/create", userController.createUser);
// @route   GET /api/v1/user/delete
// @desc    delete user 

// http://localhost:3000/api/v1/user/delete/674978d4dd893657c620c079
userRouter.delete("/delete/:userId", userController.deleteUser);


module.exports = userRouter;


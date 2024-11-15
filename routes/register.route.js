const registerController = require('../controllers/register.controller');
const express = require('express');
registerRouter = express.Router();



registerRouter.post("/login", registerController.login);
registerRouter.post("/register", registerController.register);
registerRouter.get("/posts",
    registerController.authenticateToken, 
    registerController.posts
);

registerRouter.post("/token", registerController.token);
registerRouter.delete("/logout", registerController.logout);


module.exports = registerRouter;
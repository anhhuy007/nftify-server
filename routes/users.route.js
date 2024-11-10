
const userController = require('../controllers/users.controller');
const express = require('express');
const userRouter = express.Router();

userRouter.get('/',userController.getAllUser);
userRouter.get('/:id',userController.getByID);
userRouter.get('/:id/lists',userController.getAllItems);


//jwt



module.exports = userRouter;

const userController = require('../controllers/users.controller');
const express = require('express');
const userRouter = express.Router();

item_router.get('',userController.getAllUser);
item_router.get('/:id',userController.getByID);




module.exports = userRouter;
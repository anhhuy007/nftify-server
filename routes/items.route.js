
const itemController = require('../controllers/items.controller');
const express = require('express');
const itemRouter = express.Router();


itemRouter.post('/', itemController.createItem);

// Create the route-handler callback functions
itemRouter.get('/', function(req, res){
    res.send("this is items route");
})

itemRouter.get('/list',itemController.getAllItems);
itemRouter.get('/timeFilter',itemController.itemFilteredDate);
itemRouter.get('/titleFilter',itemController.itemFilteredTitle);
itemRouter.get('/denomFilter',itemController.itemFilteredDenom);
itemRouter.get('/:id',itemController.getByID);


itemRouter.get('/123', function(req, res){
    res.send("this is items route 123");
})



module.exports = itemRouter;
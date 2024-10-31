
const ItemController = require('../controllers/Items.controller');
const express = require('express');
const item_router = express.Router();


item_router.post('/', ItemController.createItem);

// Create the route-handler callback functions
item_router.get('/', function(req, res){
    res.send("this is items route");
})
item_router.get('/:id', [
    ItemController.getByID
]);



item_router.get('/123', function(req, res){
    res.send("this is items route 123");
})



module.exports = item_router;
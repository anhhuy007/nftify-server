
const express = require('express');
const collectionRouter = express.Router({ mergeParams: true });
const collectionController = require('../controllers/collections.controller');
const registerController = require('../controllers/register.controller');

collectionRouter.get('/',(req,res, next) => {
    res.send(`collections routes`); 
});


collectionRouter.get('/list',collectionController.listCollection);
collectionRouter.get('/all',collectionController.listAllCollection);
collectionRouter.get('/favourite',
    registerController.authenticateToken, 
    collectionController.getFavouriteCollection,
);
collectionRouter.get('/:collectionId',collectionController.getCollectionById);


module.exports = collectionRouter;



// collectionRouter.get('/:id/timeFilter',collectionController.getAllItems);
// collectionRouter.get('/:id/price',collectionController.getAllItems);
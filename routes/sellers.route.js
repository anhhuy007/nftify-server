const sellerController = require('../controllers/sellers.controller');


const express = require('express');
const sellerRouter = express.Router();


//seller routes
sellerRouter.get('/',sellerController.getAllSeller);


//jwt



module.exports = sellerRouter;
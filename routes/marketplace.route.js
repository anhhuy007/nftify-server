const express = require("express");
const marketplaceRouter = express.Router({ mergeParams: true });
const marketplaceController = require("../controllers/marketplace.controller");

const sellerRouter = require("./seller.route");

marketplaceRouter.use("/users", sellerRouter);

// marketplaceRouter.get('/list',marketplaceController.listmarketplace);

module.exports = marketplaceRouter;

// marketplaceRouter.get('/:id/timeFilter',marketplaceController.getAllItems);
// marketplaceRouter.get('/:id/price',marketplaceController.getAllItems);

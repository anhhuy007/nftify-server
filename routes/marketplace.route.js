const express = require("express");
const router = express.Router();
const marketplaceController = require("../controllers/marketplace.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// guest routes
router.get("/list/trending/stamps", marketplaceController.getTrendingStamps);
router.get("/list/trending/categories", marketplaceController.getTopCategories);
router.get("/list/trending/creators", marketplaceController.getTopCreators);
router.get("/list/trending/collections", marketplaceController.getTopCollections);

router.get("/list/stamps", marketplaceController.getStamps);
router.get("/list/collections", marketplaceController.getCollections);
router.get("/list/creators", marketplaceController.getCreators);

router.get("/nfts", marketplaceController.getAllNFTs);
router.get("/stamp/:id", marketplaceController.getStampById);

router.get("/history/stampOwner/:id", marketplaceController.getStampOwnerHistory);
router.get("/history/stampPrice/:id", marketplaceController.getStampPriceHistory);

module.exports = router;
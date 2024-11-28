const MarketplaceService = require('../services/marketplace.service');
const asyncHandler = require('express-async-handler');
const { handleServiceError } = require('../utils/helperFunc');

exports.getTrendingStamps = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getTrendingStamps({
            page: req.query.page,
            limit: req.query.limit,
        });

        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getStampById = asyncHandler(async (req, res) => {
    try {
        const stamp = await MarketplaceService.getStampById(req.params.id);
        res.json(stamp);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getTopCategories = asyncHandler(async (req, res) => {
    try {
        const categories = await MarketplaceService.getTopCategories();
        res.json(categories);
    } catch (error) {
        handleServiceError(res, error);
    }
});


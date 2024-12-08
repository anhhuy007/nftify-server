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

exports.getTopCreators = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getTopCreators({
            page: req.query.page,
            limit: req.query.limit,
        });

        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getTopCollections = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getTopCollections({
            page: req.query.page,
            limit: req.query.limit,
        });

        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getStampOwnerHistory = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getStampOwnerHistory(req.params.id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getStampPriceHistory = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getStampPriceHistory(req.params.id);
        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getStampsWithFilter = asyncHandler(async (req, res) => {
    try {
        const filters = {
            title: req.query.title,
            creatorId: req.query.creatorId,
            // issuedBy: req.query.issuedBy,
            // startDate: req.query.startDate,
            // endDate: req.query.endDate,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            // color: req.query.color,
            // function: req.query.function,
            collectionName: req.query.collectionName,
            ownerName: req.query.ownerName,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            status: req.query.status,
            sort: req.query.sort
        };

        // example api 
        // /list/stamps?page=1&limit=10&title=abc&creatorId=123&issuedBy=xyz&startDate=2021-01-01&endDate=2021-12-31&minDenom=1&maxDenom=100&color=red&function=abc&sortBy=createdAt&sortOrder=asc

        const result = await MarketplaceService.getStampsWithFilter({
            page: req.query.page,
            limit: req.query.limit,
            filters: Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
            )
        });

        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getCollections = asyncHandler(async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            // description: req.query.description,
            ownerId: req.query.ownerId,
            status: req.query.status,
            // minDate: req.query.minDate,
            // maxDate: req.query.maxDate,
            minViewCount: req.query.minViewCount,
            maxViewCount: req.query.maxViewCount,
            minFavouriteCount: req.query.minFavouriteCount,
            maxFavouriteCount: req.query.maxFavouriteCount,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };

        const result = await MarketplaceService.getCollectionsWithFilter({
            page: req.query.page,
            limit: req.query.limit,
            filters: Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
            ),
        });

        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getCreators = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getCreatorsWithFilter({
            page: req.query.page,
            limit: req.query.limit,
            name: req.query.name
        });

        res.json(result);
    } catch (error) {
        handleServiceError(res, error);
    }
});

exports.getAllNFTs = asyncHandler(async (req, res) => {
    try {
        const result = await MarketplaceService.getStampsWithFilter();

        res.json(result);
    }
    catch (error) {
        handleServiceError(res, error);
    }
});
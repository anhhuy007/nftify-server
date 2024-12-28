const MarketplaceService = require("../services/marketplace.service");
const asyncHandler = require("express-async-handler");
const { handleServiceError, handleResponse } = require("../utils/helperFunc");

exports.getTrendingStamps = asyncHandler(async (req, res) => {
  try {
    const result = await MarketplaceService.getTrendingStamps({
      page: req.query.page,
      limit: req.query.limit,
    });

    if (result.items.length === 0) {
      return res
        .status(404)
        .json(handleResponse(false, "No trending stamps found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Trending stamps found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getStampById = asyncHandler(async (req, res) => {
  try {
    const stamp = await MarketplaceService.getStampById(req.params.id);
    if (!stamp) {
      return res
        .status(404)
        .json(handleResponse(false, "Stamp not found", stamp));
    }
    return res.status(200).json(handleResponse(true, "Stamp found", stamp));
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
    if (result.items.length === 0) {
      return res
        .status(404)
        .json(handleResponse(false, "No top creators found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Top creators found", result));
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

    if (result.items.length === 0) {
      return res
        .status(404)
        .json(handleResponse(false, "No top collections found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Top collections found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getStampOwnerHistory = asyncHandler(async (req, res) => {
  try {
    const result = await MarketplaceService.getStampOwnerHistory(req.params.id);
    if (result.items.length === 0) {
      return res
        .status(404)
        .json(handleResponse(false, "No owner history found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Owner history found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getStampPriceHistory = asyncHandler(async (req, res) => {
  try {
    const result = await MarketplaceService.getStampPriceHistory(req.params.id);
    if (result.items.length === 0) {
      return res
        .status(404)
        .json(handleResponse(false, "No price history found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Price history found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getStampsWithFilter = asyncHandler(async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      creatorId: req.query.creatorId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      collectionName: req.query.collectionName,
      ownerName: req.query.ownerName,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      status: req.query.status,
      sort: req.query.sort,
    };

    const result = await MarketplaceService.getStampsWithFilter({
      page: req.query.page,
      limit: req.query.limit,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
      ),
    });

    if (result.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "No stamps found", result));
    }
    return res.status(200).json(handleResponse(true, "Stamps found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCollections = asyncHandler(async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      ownerId: req.query.ownerId,
      status: req.query.status,
      minViewCount: req.query.minViewCount,
      maxViewCount: req.query.maxViewCount,
      minFavouriteCount: req.query.minFavouriteCount,
      maxFavouriteCount: req.query.maxFavouriteCount,
      sort: req.query.sort,
    };

    const result = await MarketplaceService.getCollectionsWithFilter({
      page: req.query.page,
      limit: req.query.limit,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
      ),
    });
    if (result.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "No collections found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Collections found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCreators = asyncHandler(async (req, res) => {
  try {
    const result = await MarketplaceService.getCreatorsWithFilter({
      page: req.query.page,
      limit: req.query.limit,
      name: req.query.name,
    });
    if (result.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "No creators found", result));
    }
    return res.status(200).json(handleResponse(true, "Creators found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getAllNFTs = asyncHandler(async (req, res) => {
  try {
    const result = await MarketplaceService.getStampsWithFilter();

    res.json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
});

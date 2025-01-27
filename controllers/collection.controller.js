const asyncHandler = require("express-async-handler");
const { handleServiceError, handleResponse } = require("../utils/helperFunc");
const collectionService = require("../services/collection.service");



exports.getCollectionById = asyncHandler(async (req, res) => {
  try {
    const collection = await collectionService.getCollectionById(
      req.params.collectionId
    );

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    res.json(collection);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCollections = asyncHandler(async (req, res) => {
  // sample query url: /collections/list?name=collection1&description=desc1&ownerId=abcdefxxx&status=selling&minDate=01/01/2021&maxDate=31/12/2021&minViewCount=1&maxViewCount=10&minFavouriteCount=1&maxFavouriteCount=10
  try {
    const filters = {
      name: req.query.name,
      description: req.query.description,
      ownerId: req.query.ownerId,
      status: req.query.status,
      minDate: req.query.minDate,
      maxDate: req.query.maxDate,
      minViewCount: req.query.minViewCount,
      maxViewCount: req.query.maxViewCount,
      minFavouriteCount: req.query.minFavouriteCount,
      maxFavouriteCount: req.query.maxFavouriteCount,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await collectionService.filterCollections({
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

exports.updateCollection = asyncHandler(async (req, res) => {
  try {
    const updatedCollection = await collectionService.updateCollection(
      req.params.collectionId,
      req.body
    );
    res.json(updatedCollection);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getTrendingCollections = asyncHandler(async (req, res) => {
  try {
    const result = await collectionService.getTrendingCollections({
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.increaseViewCount = asyncHandler(async (req, res) => {
  try {
    await collectionService.increaseViewCount(req.params.collectionId);
    res.json({
      message: "View count increased",
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.increaseFavouriteCount = asyncHandler(async (req, res) => {
  try {
    await collectionService.increaseFavouriteCount(req.params.collectionId);
    res.json({
      message: "Favourite count increased",
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.deleteCollection = asyncHandler(async (req, res) => {
  try {
    await collectionService.deleteCollection(req.params.collectionId);
    res.status(204).json({ message: "Collection deleted" });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCollectionDetails = asyncHandler(async (req, res) => {
  try {
    const collectionDetails = await collectionService.getCollectionDetails(
      req.params.collectionId
    );
    res.json(collectionDetails);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCollectionStamps = asyncHandler(async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      creatorId: req.query.creatorId,
      issuedBy: req.query.issuedBy,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minDenom: req.query.minDenom,
      maxDenom: req.query.maxDenom,
      color: req.query.color,
      function: req.query.function,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    const result = await collectionService.getCollectionStamps({
      collectionId: req.params.collectionId,
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

exports.getCollectionItems = asyncHandler(async (req, res) => {
  try {
    const filters = {
      title: req.query.title,
      creatorId: req.query.creatorId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      collectionName: req.query.collectionName,
      ownerName: req.query.ownerName,
      status: req.query.status,
      sort: req.query.sort,
    };
    const result = await collectionService.getCollectionItems({
      collectionId: req.params.id,
      page: req.query.page,
      limit: req.query.limit,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
      ),
    });

    // console.log("Result: ", result);  

      if (result.items.length === 0) {
          return res.status(200).json(handleResponse(true, "Collection not found", result));
      }
      return res.status(200).json(handleResponse(true, "Collection found", result));
  }
  catch (error) {
      handleServiceError(res, error);
  }
});

exports.getCollectionAbout = asyncHandler(async (req, res) => {
  try {
      const collection = await collectionService.getCollectionAbout(req.params.id);
      // console.log(collection);
      if (!collection) {
          return res.status(404).json(handleResponse(false, "Collection not found", collection));
      }
      return res.status(200).json(handleResponse(true, "Collection found", collection));
  } catch (error) {
    handleServiceError(res, error);
  }
});



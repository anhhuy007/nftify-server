const asyncHandler = require("express-async-handler");
const { handleServiceError } = require("../utils/helperFunc");
const collectionService = require("../services/collection.service");

exports.createCollection = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    console.log("Create new collection for user: ", req.user._id);

    const newCollection = await collectionService.createCollection(
      req.body,
      req.user._id
    );
    res.status(201).json(newCollection);
  } catch (error) {
    handleServiceError(res, error);
  }
});

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

exports.getTredingCollections = asyncHandler(async (req, res) => {
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
    res.status(204).end();
  } catch (error) {
    handleServiceError(res, error);
  }
});

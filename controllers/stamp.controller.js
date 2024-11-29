const StampService = require("../services/stamp.service");
const asyncHandler = require("express-async-handler");
const { handleServiceError } = require("../utils/helperFunc");
const { success } = require("jsend");

exports.createStamp = asyncHandler(async (req, res) => {
  try {
    const newStamp = await StampService.createItem(req.body);
    res.status(201).json(newStamp);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getStamps = asyncHandler(async (req, res) => {
  // query url: /stamps/list?title=stamp1&creatorId=abcdefxxx&issuedBy=issuer1&startDate=01/01/2021&endDate=31/12/2021&minDenom=1&maxDenom=10&color=red&function=franking
  try {
    // Flexible filtering based on query parameters
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
      sortOrder: req.query.sortOrder
    };

    const result = await StampService.filterItems({
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

exports.getStampStatistics = asyncHandler(async (req, res) => {
  try {
    const statistics = await StampService.getStampStatistics();
    res.json(statistics);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getStampById = asyncHandler(async (req, res) => {
  try {
    const stamp = await StampService.getItemById(req.params.id);

    res.json(stamp);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getTredingStamp = asyncHandler(async (req, res) => {
  try {
    const trendingStamp = await StampService.getTrendingStamps(
      {
        page: req.query.page,
        limit: req.query.limit
      }
    );
    res.json(trendingStamp);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.deleteStamp = asyncHandler(async (req, res) => {
  try {
    const result = await StampService.deleteItemById(req.params.id);
    res.json({
      success: true,
      message: "Stamp deleted",
      data: result
    })
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.increaseStampView = asyncHandler(async (req, res) => {
  try {
    const result = await StampService.increaseViewCount(req.params.id);
    res.json({
      success: true,
      message: "View count increased",
      data: result
    })

  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.increaseStampFavourite = asyncHandler(async (req, res) => {
  try {
    const result = await StampService.increaseFavouriteCount(req.params.id);
    res.json({
      success: true,
      message: "Favourite count increased",
      data: result
    })

  } catch (error) {
    handleServiceError(res, error);
  }
});
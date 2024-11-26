const StampService = require("../services/stamp.service");
const asyncHandler = require("express-async-handler");

// Custom error handler
const handleServiceError = (res, error) => {
  console.error('Service Error:', error);

  const errorMap = {
    'not provided': 400,   // Bad Request
    'already exists': 409, // Conflict
    'Invalid': 400,        // Bad Request
    'Missing': 400,        // Bad Request
    'Validation failed': 422, // Unprocessable Entity
  };

  const statusCode = Object.entries(errorMap)
    .find(([key]) => error.message.includes(key))?.[1] || 500;

  res.status(statusCode).json({
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack 
    })
  });
};

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
      function: req.query.function
    };

    const result = await StampService.filterStamps({
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
    const stamp = await StampService.filterStamps({
      filters: { _id: req.params.id }
    });

    if (stamp.items.length === 0) {
      return res.status(404).json({ message: 'Stamp not found' });
    }

    res.json(stamp.items[0]);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getTredingStamp = asyncHandler(async (req, res) => {
  try {
    const trendingStamp = await StampService.getTredingStamp();
    res.json(trendingStamp);
  } catch (error) {
    handleServiceError(res, error);
  }
});
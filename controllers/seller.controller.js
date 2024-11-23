const collectionModel = require("../models/collection.schema");
const asyncHandler = require("express-async-handler");

exports.getAllSellers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  try {
    // Aggregation pipeline to get distinct sellers
    const sellers = await collectionModel.aggregate([
      {
        $match: { type: "selling" }, // Filter for selling collections
      },
      {
        $lookup: {
          from: "users", // Join with users collection
          localField: "ownerId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false, // Exclude collections without matching users
        },
      },
      {
        $group: {
          _id: "$userDetails._id", // Group by user ID to avoid duplicates
          name: { $first: "$userDetails.name" },
          email: { $first: "$userDetails.email" },
          totalCollections: { $sum: 1 }, // Count how many collections they own
        },
      },
      {
        $skip: startIndex,
      },
      {
        $limit: limit,
      },
    ]);

    // Count total unique sellers
    const totalSellers = await collectionModel.aggregate([
      { $match: { type: "selling" } },
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$userDetails._id",
        },
      },
      {
        $count: "total",
      },
    ]);

    const total = totalSellers[0]?.total || 0;

    res.json({
      page,
      limit,
      total,
      total_pages: (total / limit),
      data: sellers,
    });
  } catch (err) {
    next(err);
  }
});


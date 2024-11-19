const stampModel = require("../models/stamp.schema");
const asyncHandler = require("express-async-handler");
const helperFunc = require("../utils/helperFunc");

exports.createItem = asyncHandler(async (req, res, next) => {
  const item = req.body;
  console.log("Received item:", item);
  // Check if document with this id already exists
  const existingItem = await stampModel.findOne({ id: parseInt(item.id) });
  if (existingItem) {
    console.log(`item with id: ${item.id} - already exists`);

    return helperFunc.respondPOSTItem(
      res,
      409,
      `item with id: ${item.id} - already exists`,
      null
    );
  }
  // Convert the date format to match your manual entry
  try {
    const modifiedItem = {
      ...item,
      id: parseInt(item.id),
    };
    const newItem = new stampModel(modifiedItem);
    await newItem.save();

    console.log(`Saved item with id: ${item.id}`);
    helperFunc.respondPOSTItem(res, 201, newItem, null);
  } catch (error) {
    console.error(`Failed to save item with id: ${item.id}`, error);
    helperFunc.respondPOSTItem(
      res,
      500,
      `Failed to save item with id: ${item.id}, ${error.message}`
    );
  }
});
exports.getByID = asyncHandler(async (req, res, next) => {
  //show collection
  console.log("Received query get by ID:", req.params.id);
  console.log("Collection name:", stampModel.collection.name);
  // Explicitly extract the ID parameter
  const ItemId = req.params.id;
  if (!ItemId) {
    console.error("Item ID not provided");
    return helperFunc.respondPOSTItem(res, 400, null, "Item ID not provided");
  }
  // Check if document with this id already exists
  const existingItem = await stampModel.findOne({ id: parseInt(ItemId) });
  if (!existingItem) {
    console.log(`item with id: ${ItemId} - does not exist`);
    return helperFunc.respondPOSTItem(
      res,
      404,
      null,
      `Item with id: ${ItemId} does not exist`
    );
  }
  helperFunc.respondPOSTItem(res, 200, existingItem, null);
});

exports.getAllItems = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const startIndex = (page - 1) * limit;
  const total = await stampModel.countDocuments();

  // const item = await stampModel.find().skip(startIndex).limit(limit);
  const item = await stampModel.aggregate([{ $sample: { size: limit } }]);
  res.json({
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
    data: item,
  });
});

exports.itemFilteredDate = asyncHandler(async (req, res, next) => {
  console.log("Received query:", req.query);
  console.log("collection name:", stampModel.collection.name);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startYear = req.query.start || "1950";
  const endYear = req.query.end || "1960";

  const startIndex = (page - 1) * limit;

  try {
    // Create a regex pattern that matches any year between start and end years
    const yearsRange = [];
    for (let year = parseInt(startYear); year <= parseInt(endYear); year++) {
      yearsRange.push(year.toString());
    }
    const dateFilter = {
      date: {
        $regex: `.*/(${yearsRange.join("|")})$`,
      },
    };
    // console.log('Date filter:', dateFilter);
    // Get total count of documents matching the date filter
    const total = await stampModel.countDocuments(dateFilter);
    // Find items with pagination
    // Find items with pagination and convert string dates to Date objects for sorting
    const items = await stampModel
      .find(dateFilter)
      .skip(startIndex)
      .limit(limit);
    res.json({
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: error.message,
      query: req.query,
      filter: dateFilter,
    });
  }
});
exports.itemFilteredTitle = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchTitle = req.query.title || ""; // search term
  const startIndex = (page - 1) * limit;

  // Create case-insensitive regex for partial matching
  const titleRegex = new RegExp(searchTitle, "i");
  try {
    const total = await stampModel.countDocuments({
      title: { $regex: titleRegex },
    });

    const items = await stampModel
      .find({
        title: { $regex: titleRegex },
      })
      .skip(startIndex)
      .limit(limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.itemFilteredDenom = asyncHandler(async (req, res, next) => {
  console.log("Received query:", req.query);
  console.log("collection name:", stampModel.collection.name);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const start = req.query.start || "1";
  const end = req.query.end || "10";
  const startIndex = (page - 1) * limit;
  try {
    const denomFilter = {
      denom: {
        $gte: parseInt(start),
        $lte: parseInt(end),
      },
    };
    // Get total count of documents matching the date filter
    const total = await stampModel.countDocuments(denomFilter);

    const items = await stampModel
      .find(denomFilter)
      .skip(startIndex)
      .limit(limit);
    res.json({
      total,
      limit,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: error.message,
      query: req.query,
      filter: denomFilter,
    });
  }
});

/*
Stamp value
{
  "_id": {
    "$oid": "6738b2fa4bdf92defcc61bc4"
  },
  "creatorId": "673876c24af03358be502d7b",
  "title": "King Luis I Type of 1870",
  "issuedBy": "Azores",
  "function": "postage",
  "date": "11/08/1941",
  "denom": "61.26",
  "color": "bister",
  "imgUrl": "https://stampdata.com/files/thumbs/lu/300px-Colnect-2859-487-King-Luis-I---Type-of-1870.jpg",
  "createdAt": {
    "$date": "2024-11-16T14:58:02.510Z"
  }
}
 */

exports.getTopItems = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  console.log("Top items by view count - limit (max 10): ", limit);

  try {
    const items = await itemInsightModel.aggregate([
      { $match: { verifyStatus: "verified" }},
      { $sort: { viewCount: -1 }},
      {
        $addFields: {
          itemIdObj: { $toObjectId: "$itemId" }
        }
      },
      { $limit: 10 },
      {
        $lookup: {
          from: "Stamp",
          localField: "itemIdObj",
          foreignField: "_id",
          as: "stampDetails",
        },
      },
      { $unwind: "$stampDetails" },
      {
        $project: {
          _id: 0,
          itemId: 1, 
          viewCount: 1,
          title: "$stampDetails.title",
          issuedBy: "$stampDetails.issuedBy",
          function: "$stampDetails.function",
          date: "$stampDetails.date",
          denom: "$stampDetails.denom",
          color: "$stampDetails.color",
          imgUrl: "$stampDetails.imgUrl",
        },
      },
    ]);

    res.json({
      page,
      limit,
      data: items,
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

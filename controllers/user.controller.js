const asyncHandler = require("express-async-handler");
const { handleServiceError } = require("../utils/helperFunc");
const userService = require("../services/user.service");
const nftService = require("../services/nft.service");
const { on } = require("../models/user.schema");

exports.createUser = asyncHandler(async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.json({
      success: true,
      message: "Created user successfully",
      data: newUser,
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});
exports.getUserByID = asyncHandler(async (req, res) => {
  try {
    const user = await userService.getUsesById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    handleServiceError(res, error);
  }
});
exports.getUsers = asyncHandler(async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
    };
    const result = await userService.getUsers({
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

exports.updateUser = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(
      req.params.userId,
      req.body
    );
    res.json({
      success: true,
      message: "Updated user successfully",
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});
exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    await userService.deleteUser(req.params.userId);
    res.json({
      success: true,
      message: "Deleted user successfully",
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCreatedStamps = asyncHandler(async (req, res) => {
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
      sortOrder: req.query.sortOrder,
    };

    const result = await userService.getCreatedStamps(req.params.userId, {
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
exports.getOwnedStamps = asyncHandler(async (req, res) => {
  try {
    // Flexible filtering based on query parameters
    const filters = {
      title: req.query.title,
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

    const result = await userService.getOwnedStamps(req.params.userId, {
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
exports.getFavouriteStamps = asyncHandler(async (req, res) => {
  try {
    // Flexible filtering based on query parameters
    const filters = {
      title: req.query.title,
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

    const result = await userService.getFavoriteStamps(req.params.userId, {
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

exports.createNewStamp = asyncHandler(async (req, res) => {
  try {
    // if (!req.user || !req.user._id) {
    //   return res.status(401).json({ message: "User not authenticated" });
    // }
    // const newStamp = await userService.createNewStamp(req.user._id, req.body);
    const newStamp = await userService.createNewStamp("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", req.body);

    res.status(201).json({
      success: true,
      message: "Created stamp and minted NFT successfully",
      data: newStamp,
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getMyNFTs = asyncHandler(async (req, res) => {
  try {
    // if (!req.user || !req.user._id) {
    //   return res.status(401).json({ message: "User not authenticated" });
    // }

    const userAddress = process.env.USER_ADDRESS;
    const myNFTs = await nftService.getNFTsByOwner(userAddress);
    const total = myNFTs.length;

    return res.json({
      total,
      data: myNFTs,
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});


exports.getUserCollections = asyncHandler(async (req, res) => {
  try{
    const userCollection = await userService.getUserCollections(req.params.userId);
    collections = [];
    for (collection of userCollection)
    {
      collections.push({
        name: collection.name,
        imgURL: collection.thumbUrl,
        //bgURL: collection.bgURL,
      });

    }

    if (collections.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User collections not found" });
    }
    
    res.status(200).json({
      success: true,
      message: "Get user collection successfully",
      data: collections,
    });


  }
  catch(error)
  {
    handleServiceError(res, error);
  }
});

exports.getUserActivity = asyncHandler(async (req, res) => {
  try{
    const userActivity = await userService.getUserActivity(req.params.userId);
    activities = [];
    for (activity of userActivity)
    {
      activities.push({
        name: activity.name,
        imgURL: activity.thumbUrl,
        //bgURL: collection.bgURL,
      });

    }

    if (activities.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "User activities not found" });
    }
    
    res.status(200).json({
      success: true,
      message: "Get user activities successfully",
      data: activities,
    });
}
catch(error)
{
  handleServiceError(res, error);
}
});

exports.getItemsOnSale = asyncHandler(async (req, res) => {
  try {
    const itemsOnSale = await userService.getUserOnSaleItems(req.params.userId);
    if (itemsOnSale.length === 0) {
      return res.status(404).json({ message: "Items on sale not found" });
    }
    res.json(itemsOnSale);
  }
catch(error)
{
  handleServiceError(res, error);
}
}
);

const asyncHandler = require("express-async-handler");
const { handleServiceError } = require("../utils/helperFunc");
const userService = require("../services/user.service");
const nftService = require("../services/nft.service");

exports.createUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newUser = await userService.createUser(
      req.user._id,
      req.body
    );
    
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
      req.user._id,
      req.body
    );
    res.json({
      success: true,
      message: "Updated user successfully",
      data: updatedUser
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});
exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    await userService.deleteUser(req.user._id);
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
    const newStamp = await userService.createNewStamp(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      req.body
    );

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
exports.connectWallet = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const updatedUser = await userService.connectWallet(
      req.user._id,
      req.body.walletAddress
    );
    // const updatedUser = await userService.connectWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", req.body.walletAddress);

    res.json({
      success: true,
      message: "Connected wallet successfully",
      data: updatedUser,
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

// setting page
exports.getUserSettings = asyncHandler(async (req, res) => {
  try {

    const userSettings = await userService.getUserSettings(req.user._id);
    res.json(userSettings);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.changeUserProfile = asyncHandler(async (req, res) => {
  try {
    const updatedUser = await userService.changeUserProfile(
      req.user._id,
      req.body
    );
    res.json(updatedUser);
  } catch (error) {
    handleServiceError(res, error);
  }

});

exports.checkPassword = asyncHandler(async (req, res) => { 
  try {
    const result = await userService.checkPassword(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error);
  }

});
// change password
exports.changePassword = asyncHandler(async (req, res) => {
  try {
    const result = await userService.changePassword(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.changeEmail = asyncHandler(async (req, res) => {
  try {
    const result = await userService.changeEmail(req.user._id, req.body);
    res.json(result);
  } catch (error) {
    handleServiceError(res, error);
  }
});
const asyncHandler = require("express-async-handler");
const { handleServiceError, handleResponse } = require("../utils/helperFunc");
const userService = require("../services/user.service");
const collectionService = require("../services/collection.service");
const nftService = require("../services/nft.service");
const ItemInsight = require("../models/itemInsight.schema");

exports.getUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    const user = await userService.getUserById(req.user._id);
    res.json({
      success: true,
      message: "Retrieved user successfully",
      data: user,
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.createUser = asyncHandler(async (req, res) => {
  try {
    if (!req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newUser = await userService.createUser(req.user._id, req.body);

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
    const user = await userService.getUserById(req.params.userId);

    const totalOwnedStamps = await userService.getTotalOwnedStamps(
      req.params.userId
    );

    const totalCreatedStamps = await userService.getTotalCreatedStamps(
      req.params.userId
    );
    if (!user) {
      return res
        .status(404)
        .json(handleResponse(false, "User not found", user));
    }
    const response = {
      user: user,
      totalOwnedStamps: totalOwnedStamps,
      totalCreatedStamps: totalCreatedStamps,
    };
    res.status(200).json(handleResponse(true, "Find user success", response));
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
    const updatedUser = await userService.updateUser(req.user._id, req.body);
    if (!updatedUser) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot update user", updatedUser));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Updated user successfully", updatedUser));
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
    if (result.items.length === 0) {
      return res
        .status(404)
        .json(handleResponse(false, "Created stamps not found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Get created stamps successfully", result));
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
      sort: req.query.sort,
    };

    const result = await userService.getOwnedStamps(req.params.userId, {
      page: req.query.page,
      limit: req.query.limit,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
      ),
    });
    if (result.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "Owned stamps not found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Get owned stamps successfully", result));
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
    if (result.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "Favourite stamps not found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Get favourite stamps successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.createNewStamp = asyncHandler(async (req, res) => {
  try {
    const { newStamp, newOwnership, newPrice, newItemInsight } =
      await userService.createNewStamp(req.body);

    if (!newStamp || !newOwnership || !newPrice || !newItemInsight) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot create stamp", newStamp));
    }

    return res
      .status(200)
      .json(handleResponse(true, "Create new stamp successfully", newStamp));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.editStamp = asyncHandler(async (req, res) => {
  try {
    const result = await userService.editStamp(req.body);
    if (result.status === false) {
      console.log(result.message);
      return res
        .status(404)
        .json(handleResponse(false, result.message, result));
    }
    return res.status(200).json(handleResponse(true, result.message, result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.deleteStamp = asyncHandler(async (req, res) => {
  try {
    const deletedStamp = await userService.deleteStamp(req.user._id, req.params._id);
    if (deletedStamp.success === false) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot delete stamp", deletedStamp));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Deleted stamp successfully", deletedStamp));
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
  try {
    const filters = {
      name: req.query.name,

      ownerId: req.params.userId,

      status: req.query.status,
      minViewCount: req.query.minViewCount,
      maxViewCount: req.query.maxViewCount,
      minFavouriteCount: req.query.minFavouriteCount,
      maxFavouriteCount: req.query.maxFavouriteCount,
      sortBy: req.query.sortBy,
      sort: req.query.sort,
      // sortOrder: req.query.sortOrder
    };
    const userCollection = await userService.getUserCollections({
      page: req.query.page,
      limit: req.query.limit,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
      ),
    });

    if (userCollection.items.length === 0) {
      return res
        .status(200)
        .json(
          handleResponse(true, "User collections not found", userCollection)
        );
    }

    res
      .status(200)
      .json(
        handleResponse(
          true,
          "Get user collections successfully",
          userCollection
        )
      );
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getUserActivity = asyncHandler(async (req, res) => {
  try {
    const userActivity = await userService.getUserActivity(req.params.userId);
    activities = [];
    for (activity of userActivity) {
      activities.push({
        name: activity.name,
        imgURL: activity.thumbUrl,
        //bgURL: collection.bgURL,
      });
    }

    if (activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User activities not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get user activities successfully",
      data: activities,
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getItemsOnSale = asyncHandler(async (req, res) => {
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
    const itemsOnSale = await userService.getUserOnSaleItems(
      (userId = req.params.userId),
      {
        page: req.query.page,
        limit: req.query.limit,
        filters: Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v != null) // Remove null values from filters
        ),
      }
    );
    if (itemsOnSale.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "Items on sale not found", itemsOnSale));
    }
    return res
      .status(200)
      .json(
        handleResponse(true, "Get items on sale successfully", itemsOnSale)
      );
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
    if (!userSettings) {
      return res
        .status(404)
        .json(
          handleResponse(false, "Cannot change user settings", userSettings)
        );
    }
    return res
      .status(201)
      .json(
        handleResponse(true, "Change user settings successfully", userSettings)
      );
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

    if (!updatedUser) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot change user profile", updatedUser));
    }
    // console.log(updatedUser);
    return res
      .status(201)
      .json(
        handleResponse(true, "Change user profile successfully", updatedUser)
      );
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.checkPassword = asyncHandler(async (req, res) => {
  try {
    const result = await userService.checkPassword(req.user._id, req.body);
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot check password", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Check password successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});
// change password
exports.changePassword = asyncHandler(async (req, res) => {
  try {
    const result = await userService.changePassword(req.user._id, req.body);
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot change password", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Change password successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.addToCart = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await userService.addToCart(req.user._id, req.body.itemId);
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot add item to cart", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Added item to cart successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await userService.removeFromCart(
      req.user._id,
      req.body.itemId
    );

    return res
      .status(201)
      .json(
        handleResponse(true, "Removed item from cart successfully", result)
      );
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.checkoutCart = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await userService.checkoutCart(req.user._id);
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot checkout cart", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Checkout cart successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.clearCart = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await userService.clearCart(req.user._id);
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot clear cart", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Clear cart successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCart = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const result = await userService.getCart(req.user._id);
    // const result = await userService.getCartItems("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    if (result.items.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "Cart items not found", result));
    }
    return res
      .status(200)
      .json(handleResponse(true, "Get cart items successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});
exports.changeEmail = asyncHandler(async (req, res) => {
  try {
    const result = await userService.changeEmail(req.user._id, req.body);
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot change email", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Change email successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getCollectionList = asyncHandler(async (req, res) => {
  try {
    // console.log(req.user);
    // console.log(req.user._id);
    const result = await collectionService.getCollectionList(req.user._id);
    if (result.length === 0) {
      return res
        .status(200)
        .json(handleResponse(true, "User doesn't have collection", result));
    }

    return res
      .status(404)
      .json(handleResponse(true, "Collection found", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.initWallet = asyncHandler(async (req, res) => {
  try {
    const result = await userService.initWallet(
      req.user._id,
      req.body.walletAddress
    );
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot init wallet", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Init wallet successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.createCollection = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("Create new collection for user: ", req.user._id);

    const newCollection = await collectionService.createCollection(
      req.body,
      req.user._id
    );
    return res
      .status(201)
      .json(
        handleResponse(
          true,
          "Create new collection successfully",
          newCollection
        )
      );
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.deleteCollection = asyncHandler(async (req, res) => {
  try {
    const result = await collectionService.deleteCollection(
      req.body.collectionId
    );
    if (!result) {
      return res
        .status(404)
        .json(handleResponse(false, "Cannot delete collection", result));
    }
    return res
      .status(201)
      .json(handleResponse(true, "Delete collection successfully", result));
  } catch (error) {
    handleServiceError(res, error);
  }
});

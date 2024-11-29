const asyncHandler = require("express-async-handler");
const { handleServiceError } = require("../utils/helperFunc");
const userService = require("../services/user.service");

exports.createUser = asyncHandler(async (req, res) => {
  try {
    const newUser = await userService.createUser(
      req.body,
    );
    res.json({
      success: true,
      message: "Created user successfully",
      data: newUser
    })
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
        const result = await userService.filterUser({
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
    })
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
    })
  } catch (error) {
    handleServiceError(res, error);
  }
});

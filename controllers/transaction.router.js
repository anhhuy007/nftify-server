const asyncHandler = require("express-async-handler");
const transactionService = require("../services/transaction.service");
const { handleServiceError, handleResponse } = require("../utils/helperFunc");


exports.getTransactions = asyncHandler(async (req, res) => {
    const transactions = await transactionService.getTransactions();
    handleResponse(res, transactions);
});
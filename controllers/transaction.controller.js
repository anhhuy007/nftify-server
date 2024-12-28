const asyncHandler = require("express-async-handler");
const transactionService = require("../services/transaction.service");
const { handleServiceError, handleResponse } = require("../utils/helperFunc");

exports.createTransaction = asyncHandler(async (req, res) => {
  try {
    const transaction = req.body;
    const newTransaction = await transactionService.createTransaction(
      transaction
    );
    res
      .status(201)
      .json(handleResponse(true, "Transaction created", newTransaction));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getTransactions = asyncHandler(async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions({
      page: req.query.page,
      limit: req.query.limit,
    });

    res.json(handleResponse(true, "Transactions retrieved", transactions));
  } catch (error) {
    handleServiceError(res, error);
  }
});

exports.getTransactionByHash = asyncHandler(async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionByHash(
      req.params.transactionHash
    );
    if (!transaction) {
      return res
        .status(404)
        .json(handleResponse(false, "Transaction not found"));
    }
    res.json(handleResponse(true, "Transaction retrieved", transaction));
  } catch (error) {
    handleServiceError(res, error);
  }
});

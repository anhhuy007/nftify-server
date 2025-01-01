const express = require("express");
const transactionRouter = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

transactionRouter.get("/list", transactionController.getTransactions);
transactionRouter.get("/find/:transactionHash", transactionController.getTransactionByHash);
transactionRouter.get("/overview", transactionController.getTransactionOverview);

transactionRouter.use(authenticateToken);
transactionRouter.post("/", transactionController.createTransaction);

module.exports = transactionRouter;
const express = require("express");
const transactionRouter = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

transactionRouter.use(authenticateToken);
transactionRouter.get("/list", transactionController.getTransactions);
transactionRouter.get("/find/:transactionHash", transactionController.getTransactionByHash);
transactionRouter.post("/", transactionController.createTransaction);
transactionRouter.get("/overview", transactionController.getTransactionOverview);

module.exports = transactionRouter;
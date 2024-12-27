const express = require("express");
const transactionRouter = express.Router();
const transactionController = require("../controllers/transaction.controller");

transactionRouter.get("/list", transactionController.getTransactions);
transactionRouter.get("/find", transactionController.getTransactions);

module.exports = transactionRouter;
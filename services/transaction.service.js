const mongoose = require("mongoose");
const transactionModel = require("../models/transaction.schema");

class TransactionService {
    async createTransaction(transaction) {
        return await transactionModel.create(transaction);
    }

    async getTransactions(options = {}) {
        const { page = 1, limit = 10 } = options;
    
        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const [total, transactions] = await Promise.all([
            transactionModel.countDocuments(),
            transactionModel.find().skip(skip).limit(parsedLimit).exec()
        ]);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            items: transactions
        };
    }

    async getTransactionByHash(hash) {
        return await this.transactionModel.findOne({ transactionHash });
    }
}

module.exports = new TransactionService();
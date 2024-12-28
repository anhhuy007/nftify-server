const mongoose = require("mongoose");

class TransactionService {
    async createTransaction(transaction) {
        return await this.transactionModel.create(transaction);
    }

    async getTransactions() {
        const { page = 1, limit = 10 } = options;
    
        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(Math.max(1, parseInt(limit)), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const [total, transactions] = await Promise.all([
            this.transactionModel.countDocuments(),
            this.transactionModel.find().skip(skip).limit(parsedLimit).exec()
        ]);

        return {
            total,
            page: parsedPage,
            limit: parsedLimit,
            transactions
        };
    }

    async getTransactionByHash(hash) {
        return await this.transactionModel.findOne({ transactionHash });
    }
}

module.exports = new TransactionService();
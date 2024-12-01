const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const accountModel = require('../models/account.schema');

const authenticateToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log('decoded: ', decoded);  
    const account = await accountModel.findOne({ username: decoded.userName });
    console.log('account: ', account);

    if (!account) return res.status(401).json({ message: 'Account not found' });

    // pass the account to the next middleware
    req.user = account;
    next();
});

module.exports = { authenticateToken };
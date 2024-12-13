const jwt = require('jsonwebtoken');
const accountModel = require('../models/account.schema');

const authenticateToken = (async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided' 
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            console.log('decoded:', decoded);
            const account = await accountModel.findOne({ username: decoded.userName });

            if (!account) {
                return res.status(401).json({ 
                    message: 'Account not found' 
                });
            }

            req.user = account;
            next();
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    message: 'Token expired',
                    expired: true
                });
            } else if (jwtError instanceof jwt.JsonWebTokenError) {
                return res.status(403).json({
                    message: 'Invalid token'
                });
            }
            throw jwtError;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
});

module.exports = { authenticateToken };
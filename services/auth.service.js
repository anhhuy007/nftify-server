const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AccountModel = require('../models/account.schema');
const TokenModel = require('../models/token.schema');

class AuthService {
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user._id, 
                username: user.username,
                email: user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            {
                id: user._id, 
                username: user.username,
                email: user.email
            },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );
    }

    async registerUser(userData) {
        const { username, password, email } = userData;
        
        // validate input
        if (!username || !email || !password) {
            throw new Error('[Error][Missing] Required fields are missing');
        }

        // check for existing account
        const existingAccount = await AccountModel.findOne({ 
            $or: [{ username: username }, { email: email }] 
        });
        if (existingAccount) {
            throw new Error('[Error][Exist] Account already exists');
        }

        // create new account
        const newUser = new AccountModel({
            username: username,
            email: email,
            password: await bcrypt.hash(password, 10)
        });

        return newUser.save();
    }

    async login(userData) { 
        const { username, password } = userData;

        const account = await AccountModel.findOne({ username: username });

        if (!account) {
            throw new Error('[Error][NoneExist] Account not found');
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            throw new Error('[Error][Unvalid] Incorrect password');
        }

        const accessToken = this.generateAccessToken(account);
        const refreshToken = this.generateRefreshToken(account);

        // save refresh token to database
        const newToken = new TokenModel({
            userId: account._id,
            token: refreshToken,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        await newToken.save();

        return {
            account, 
            accessToken, 
            refreshToken 
        };
    }

    async refreshAccessToken(userId) {
        if (!userId) {
            throw new Error('[Error][Missing] No refresh token provided');
        }

        const savedToken = await TokenModel.findOne({ userId });

        if (!savedToken) {
            throw new Error('[Error][Invalid] Invalid refresh token');
        }

        // check expired refresh token
        if (savedToken.expiresAt < Date.now()) {
            await TokenModel.deleteOne({ userId });
            throw new Error('[Error][Other] Refresh token expired');
        }

        try {
            const decoded = jwt.verify(savedToken.token, process.env.REFRESH_TOKEN_SECRET);

            // check account id match
            if (decoded.id !== userId) {
                throw new Error('[Error][Invalid] Refresh token does not match user');
            }

            const account = await AccountModel.findById(decoded.id);
            if (!account) {
                throw new Error('[Error][NonExist] Account not found');
            }   

            const accessToken = this.generateAccessToken(account);
            return { accessToken };
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('[Error][Expire] Refresh token expired');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new Error('[Error][Invalid] Invalid refresh token');
            }

            throw error;
        }
    }

    async logout(userId) {
        if (!userId) {
            throw new Error('[Error][Missing] No user ID provided');
        }

        try {
            await TokenModel.deleteMany({ userId });
            return true;
        }
        catch (error) {
            throw new Error('[Error][Other] Failed to logout');
        }
    }
}

module.exports = new AuthService();

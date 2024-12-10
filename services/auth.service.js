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
            throw new Error('Missing required fields');
        }

        // check for existing account
        const existingAccount = await AccountsModel.findOne({ 
            $or: [{ username: userName }, { email: email }] 
        });
        if (existingAccount) {
            throw new Error('Account already exists');
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
            throw new Error('Account not found');
        }

        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const accessToken = this.generateAccessToken(account);
        const refreshToken = this.generateRefreshToken(account);

        // save refresh token to database
        const newToken = new TokenModel({
            token: refreshToken
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
            throw new Error('No refresh token provided');
        }

        const savedToken = await TokenModel.findOne({ userId });

        if (!savedToken) {
            throw new Error('Invalid refresh token');
        }

        // check expired refresh token
        if (savedToken.expiresAt < Date.now()) {
            await TokenModel.deleteOne({ userId });
            throw new Error('Refresh token expired');
        }

        try {
            const decoded = jwt.verify(savedToken.token, process.env.REFRESH_TOKEN_SECRET);

            // check account id match
            if (decoded.id !== userId) {
                throw new Error('Invalid refresh token');
            }

            const account = await AccountModel.findById(decoded.id);
            if (!account) {
                throw new Error('Account not found');
            }   

            const accessToken = this.generateAccessToken(account);
            return { accessToken };
        }
        catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid refresh token');
            }

            throw error;
        }
    }

    async logout(userId) {
        if (!userId) {
            throw new Error('No user id provided');
        }

        try {
            await TokenModel.deleteMany({ userId });
            return true;
        }
        catch (error) {
            throw new Error('Failed to logout');
        }
    }
}

module.exports = new AuthService();
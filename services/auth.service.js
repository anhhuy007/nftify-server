const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AccountModel = require('../models/account.schema');
const TokenModel = require('../models/token.schema');
const UserModel = require('../models/user.schema');

class AuthService {
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user._id, 
                username: user.username,
                email: user.email
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
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
        const savedAccount = await newUser.save();

        // create new user
        const defaultAvatars = [
            'https://i.pinimg.com/736x/9e/5c/c8/9e5cc8988ced2938cb52367395c238ae.jpg',
            'https://i.pinimg.com/1200x/fc/31/5a/fc315a4736b5b22cbfb96cd9ea786952.jpg',
            'https://i.pinimg.com/1200x/97/a0/ef/97a0eff3eb0fbbbbc0f71565caec94a9.jpg',
            'https://i.pinimg.com/1200x/c1/12/5d/c1125d529a1d1886cc2eaf0a7bca8d1d.jpg',
            'https://i.pinimg.com/1200x/4f/13/1d/4f131d9a7a9f9d7ad1781a799616e92c.jpg',
            'https://i.pinimg.com/1200x/fb/4f/1e/fb4f1ef3f1baf2c956a84a586498f5ef.jpg'
        ];
        const newUserProfile = new UserModel({
            _id: savedAccount._id,
            name: username,
            avatarUrl: defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
        });
        await newUserProfile.save();

        return savedAccount;
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

    async refreshAccessToken(refreshToken) {
        if (!refreshToken) {
            throw new Error('[Error][Missing] No refresh token provided');
        }

        const savedToken = await TokenModel.findOne({ token: refreshToken });

        if (!savedToken) {
            throw new Error('[Error][Invalid] Invalid refresh token');
        }

        // check expired refresh token
        if (savedToken.expiresAt < Date.now()) {
            await TokenModel.deleteOne({ token: refreshToken });
            throw new Error('Refresh token expired');
        }

        try {
            const decoded = jwt.verify(savedToken.token, process.env.REFRESH_TOKEN_SECRET);

            const account = await AccountModel.findById(decoded.id);
            if (!account) {
                throw new Error('[Error][NonExist] Account not found');
            }   

            const accessToken = this.generateAccessToken(account);

            console.log("New access token generated: ", accessToken);
            console.log("Account: ", account);

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

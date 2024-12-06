const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const AccountsModel = require('../models/account.schema');
const UserModel = require('../models/user.schema');

const refreshTokens = [];

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    });
};

const registerUser = async (userData) => {
    const { userName, password, email } = userData;

    const existingAccount = await AccountsModel.findOne({ username: userName });
    if (existingAccount) {
        throw new Error('Username already exists');
    }

    const existingEmail = await AccountsModel.findOne({ email: email });
    if (existingEmail) {
        throw new Error('Email already exists');
    }

    // const lastAccount = await AccountsModel.findOne().sort({ id: -1 }).exec();
    // const newId = lastAccount ? parseInt(lastAccount.id) + 1 : 1;

    const account = new AccountsModel({
        // id: newId,
        username: userName,
        password: await bcrypt.hash(password, 10),
        email: email,
        createdAt: new Date()
    });

    const user = new UserModel({
        _id: account._id,
        name: userName,
        description: "default description",
        avatarUrl: "default avatar",
        gender: "Others",
        status: "pending",
        wallet_address: "default wallet address",
    });
    account.save(), user.save()

    return { account, user };
};

const loginUser = async (userData) => {
    const { userName, password } = userData;

    const account = await AccountsModel.findOne({ username: userName });
    if (!account) {
        throw new Error('Account not found');
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
        throw new Error('Invalid login credentials');
    }

    const user = { userName };
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    
    refreshTokens.push(refreshToken);

    // remove password from account object
    account.password = "";

    return { account, accessToken, refreshToken };
};

const refreshAccessToken = (token) => {
    if (!token) throw new Error('No token provided');
    if (!refreshTokens.includes(token)) throw new Error('Invalid refresh token');

    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) reject(err);
            const accessToken = generateAccessToken({ userName: user.userName });
            resolve({ accessToken });
        });
    });
};

const logout = (token) => {
    const index = refreshTokens.indexOf(token);
    if (index > -1) {
        refreshTokens.splice(index, 1);
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logout,
    generateAccessToken
};
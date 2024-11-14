const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AccountsModel = require("../models/accounts.model");
const helperFunc = require("../helperFunc");

exports.login = asyncHandler(async (req, res, next) => {
    const userName = req.body.userName;
    const password = req.body.password;
    const user = {
        userName: userName,
        password: password,
    };
    // const accessToken = generateAccessToken(user);
    // const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    // refreshTokens.push(refreshToken);

    // res.json({ accessToken: accessToken, refreshToken: refreshToken });
    const account = await AccountsModel.findOne({
        username: user.userName,
    });
    if (!account) {
        return helperFunc.sendResponse(res, 404, "Account not found");
    }
    try {
        if (await bcrypt.compare(user.password, account.password)) {
            return helperFunc.sendResponse(res, 200, "Login success");
        } else {
            return helperFunc.sendResponse(res, 401, "Not allow login");
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

exports.register = asyncHandler(async (req, res, next) => {
    const userName = req.body.userName;
    const password = req.body.password;
    const email = req.body.email;
    console.log(req.body);

    existingAccount = await AccountsModel.findOne({
        username: userName,
    });
    if (existingAccount) {
        return helperFunc.sendResponse(res, 400, "Username already exist");
    }
    // choose new Id for new account that is next to the last account
    const lastAccount = await AccountsModel.findOne().sort({ id: -1 }).exec();
        // Start from 1 if no accounts exist
    const newId = lastAccount ? parseInt(lastAccount.id) + 1 : 1;
    console.log(newId);

    const account = new AccountsModel({
        id: newId,
        username: userName,
        password: await bcrypt.hash(password, 10),
        email: email,
        createdAt: helperFunc.returnCurrentDate(),
    });
    try {
        const newAccount = await account.save();
        return helperFunc.sendResponse(res, 200, newAccount);
    } catch (err) {
        console.log(err);
        return res.status(500).send(err);
    }
});

const posts = [
    {
        userName: "John",
        title: "Post 1",
    },
    {
        userName: "Jim",
        title: "Post 2",
    },
];

exports.authenticateToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
});
exports.posts = asyncHandler(async (req, res, next) => {
    res.json(posts.filter((post) => post.userName === req.user.userName));
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "20s",
    });
}

let refreshTokens = [];
exports.token = asyncHandler(async (req, res, next) => {
    const newReFreshToken = req.body.token;
    if (newReFreshToken == null) return res.sendStatus(401);

    if (!refreshTokens.includes(newReFreshToken)) {
        console.log("refreshtoken not found");
        return res.sendStatus(403);
    }

    jwt.verify(
        newReFreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
            if (err) {
                console.log(err);
                return res.sendStatus(403);
            }
            const accessToken = generateAccessToken({
                userName: user.userName,
            });
            res.json({ accessToken: accessToken });
        }
    );
});

exports.logout = asyncHandler(async (req, res, next) => {
    refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
    res.sendStatus(204);
});

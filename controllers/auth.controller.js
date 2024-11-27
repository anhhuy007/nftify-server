const asyncHandler = require('express-async-handler');
const authServices = require('../services/auth.service');
const helperFunc = require('../utils/helperFunc');

exports.register = asyncHandler(async (req, res) => {
    try {
        const newAccount = await authServices.registerUser(req.body);
        return res.status(201).json(newAccount);
    } catch (err) {
        return helperFunc.handleServiceError(res, err);
    }
});

exports.login = asyncHandler(async (req, res) => {
    try {
        const tokens = await authServices.loginUser(req.body);
        return res.json({
            message: 'Login successful',
            ...tokens
        });
    } catch (err) {
        return helperFunc.handleServiceError(res, err);
    }
});

exports.token = asyncHandler(async (req, res) => {
    try {
        const { accessToken } = await authServices.refreshAccessToken(req.body.token);
        return res.json({ accessToken });
    } catch (err) {
        return helperFunc.handleServiceError(res, err);
    }
});

exports.logout = asyncHandler(async (req, res) => {
    authServices.logout(req.body.token);
    return res.status(204).json({
        message: 'Logout successful'
    })
});

exports.posts = asyncHandler(async (req, res) => {
    res.json({
        messages: 'this is shit posts'
    });
});
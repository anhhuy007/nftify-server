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
        const response = await authServices.login(req.body);
        response.account.password = undefined;
        return res.json({
            message: 'Login successful',
            ...response
        });
    } catch (err) {
        // return res.status(401).json({
        //     message: err.message
        // });
        return helperFunc.handleServiceError(res, err);
    }
});

exports.refreshToken = asyncHandler(async (req, res) => {
    try {
        const { accessToken } = await authServices.refreshAccessToken(req.body.token);
        return res.json({
            success: true,
            message: 'Token refreshed', 
            accessToken 
        });
    } catch (err) {
        return helperFunc.handleServiceError(res, err);
    }
});

exports.logout = asyncHandler(async (req, res) => {
    try {
        authServices.logout(req.user._id);
        return res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        return helperFunc.handleServiceError(res, error);
    }
});

exports.posts = asyncHandler(async (req, res) => {
    res.json({
        messages: 'this is shit posts'
    });
});